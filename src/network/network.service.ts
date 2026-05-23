import { Injectable, NotFoundException } from '@nestjs/common';
import { Graph } from './entities/graph.entity';
import { UploadNetworkDto } from './dto/upload-network.dto';
import * as crypto from 'crypto';

@Injectable()
export class NetworkService {
  private readonly MAX_NETWORKS = 5;
  private networks: Graph[] = [];

  upload(uploadNetworkDto: UploadNetworkDto): { id: string } {
    const id = crypto.randomUUID();
    const nodes = new Set<string>();

    uploadNetworkDto.edges.forEach((edge) => {
      nodes.add(edge.from);
      nodes.add(edge.to);
    });

    const graph: Graph = {
      id,
      nodes: Array.from(nodes),
      edges: uploadNetworkDto.edges,
    };

    this.networks.push(graph);

    // Keep only the last 5 networks
    if (this.networks.length > this.MAX_NETWORKS) {
      this.networks.shift();
    }

    return { id };
  }

  getNodes(id: string): string[] {
    const network = this.networks.find((n) => n.id === id);
    if (!network) {
      throw new NotFoundException(`Network with id ${id} not found`);
    }
    return network.nodes;
  }

  getNetwork(id: string): Graph {
    const network = this.networks.find((n) => n.id === id);
    if (!network) {
      throw new NotFoundException(`Network with id ${id} not found`);
    }
    return network;
  }
}
