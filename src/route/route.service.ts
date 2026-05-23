import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { NetworkService } from '../network/network.service';
import { OptimizeRouteDto, OptimizationPreference } from './dto/optimize-route.dto';
import { EdgeDto } from '../network/dto/upload-network.dto';

@Injectable()
export class RouteService {
  constructor(private readonly networkService: NetworkService) {}

  optimize(id: string, optimizeRouteDto: OptimizeRouteDto) {
    const startTime = process.hrtime();
    const network = this.networkService.getNetwork(id);
    
    const { originNodeId, destinationNodeId, preference, constraints } = optimizeRouteDto;

    if (!network.nodes.includes(originNodeId)) {
      throw new BadRequestException(`Origin node ${originNodeId} is invalid.`);
    }
    if (!network.nodes.includes(destinationNodeId)) {
      throw new BadRequestException(`Destination node ${destinationNodeId} is invalid.`);
    }

    const { path, totalCost } = this.calculateShortestPath(network.edges, originNodeId, destinationNodeId, preference, constraints?.avoidHighways);

    if (path.length === 0 && originNodeId !== destinationNodeId) {
      throw new NotFoundException(`No valid path found from ${originNodeId} to ${destinationNodeId}.`);
    }

    const endTime = process.hrtime(startTime);
    const durationMs = endTime[0] * 1000 + endTime[1] / 1000000;

    return {
      graphId: id,
      totalCost,
      path,
      durationMs,
    };
  }

  private calculateShortestPath(
    edges: EdgeDto[],
    origin: string,
    destination: string,
    preference: OptimizationPreference = OptimizationPreference.SHORTEST,
    avoidHighways: boolean = false
  ): { path: string[], totalCost: number } {
    // Adjacency list
    const graph: Record<string, { to: string, cost: number }[]> = {};

    // Initialize all known nodes to ensure isolated nodes are represented
    edges.forEach(edge => {
        if (!graph[edge.from]) graph[edge.from] = [];
        if (!graph[edge.to]) graph[edge.to] = [];
    });

    edges.forEach((edge) => {
      if (avoidHighways && edge.isHighway) {
        return; // Ignore this edge
      }

      let edgeCost = edge.cost;
      if (preference === OptimizationPreference.FASTEST && edge.time !== undefined) {
        edgeCost = edge.time;
      }

      graph[edge.from].push({ to: edge.to, cost: edgeCost });
    });

    const distances: Record<string, number> = {};
    const previous: Record<string, string | null> = {};
    const unvisited = new Set<string>();

    for (const node in graph) {
      distances[node] = Infinity;
      previous[node] = null;
      unvisited.add(node);
    }
    if (distances[origin] === undefined) {
        // Just in case origin doesn't exist in edges at all
        return { path: [], totalCost: 0 };
    }
    distances[origin] = 0;

    while (unvisited.size > 0) {
      let currentNode: string | null = null;
      let minDistance = Infinity;

      for (const node of unvisited) {
        if (distances[node] < minDistance) {
          currentNode = node;
          minDistance = distances[node];
        }
      }

      if (currentNode === null || currentNode === destination) {
        break; // Reached destination or no reachable nodes left
      }

      unvisited.delete(currentNode);

      for (const neighbor of graph[currentNode]) {
        if (unvisited.has(neighbor.to)) {
          const altDistance = distances[currentNode] + neighbor.cost;
          if (altDistance < distances[neighbor.to]) {
            distances[neighbor.to] = altDistance;
            previous[neighbor.to] = currentNode;
          }
        }
      }
    }

    const path: string[] = [];
    let curr: string | null = destination;
    
    if (previous[curr] !== null || curr === origin) {
      while (curr !== null) {
        path.unshift(curr);
        curr = previous[curr];
      }
    }

    if (path.length <= 1 && origin !== destination) {
       return { path: [], totalCost: 0 }; // Not reachable
    }

    return { path, totalCost: distances[destination] };
  }
}
