import { Test, TestingModule } from '@nestjs/testing';
import { RouteService } from './route.service';
import { NetworkService } from '../network/network.service';
import { OptimizationPreference } from './dto/optimize-route.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('RouteService', () => {
  let routeService: RouteService;
  let networkService: NetworkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RouteService,
        {
          provide: NetworkService,
          useValue: {
            getNetwork: jest.fn(),
          },
        },
      ],
    }).compile();

    routeService = module.get<RouteService>(RouteService);
    networkService = module.get<NetworkService>(NetworkService);
  });

  it('should be defined', () => {
    expect(routeService).toBeDefined();
  });

  describe('optimize', () => {
    const mockNetwork = {
      id: 'test-id',
      nodes: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
      edges: [
        { from: 'A', to: 'B', cost: 10, time: 5 },
        { from: 'A', to: 'C', cost: 5, time: 6 },
        { from: 'B', to: 'D', cost: 8, time: 4 },
        { from: 'C', to: 'D', cost: 12, time: 10, isHighway: true },
        { from: 'D', to: 'E', cost: 12, time: 10 },
        { from: 'D', to: 'F', cost: 4, time: 2 },
        { from: 'F', to: 'G', cost: 4, time: 5 },
        { from: 'E', to: 'G', cost: 9, time: 8 },
        { from: 'C', to: 'H', cost: 8, time: 4 },
        { from: 'D', to: 'H', cost: 4, time: 5 },
        { from: 'F', to: 'H', cost: 1, time: 1 },
      ],
    };

    it('should calculate the shortest path (default preference)', () => {
      jest.spyOn(networkService, 'getNetwork').mockReturnValue(mockNetwork);

      const result = routeService.optimize('test-id', {
        originNodeId: 'A',
        destinationNodeId: 'H',
      });

      // A -> C (5) -> H (8) = 13
      // A -> B (10) -> D (8) -> H (4) = 22
      expect(result.totalCost).toBe(13);
      expect(result.path).toEqual(['A', 'C', 'H']);
      expect(result.graphId).toBe('test-id');
    });

    it('should calculate the fastest path (preference = fastest)', () => {
      jest.spyOn(networkService, 'getNetwork').mockReturnValue(mockNetwork);

      const result = routeService.optimize('test-id', {
        originNodeId: 'A',
        destinationNodeId: 'H',
        preference: OptimizationPreference.FASTEST,
      });

      // Based on time:
      // A -> B (5) -> D (4) -> F (2) -> H (1) = 12
      // A -> C (6) -> H (4) = 10
      expect(result.totalCost).toBe(10);
      expect(result.path).toEqual(['A', 'C', 'H']);
    });

    it('should avoid highways when constrained', () => {
      jest.spyOn(networkService, 'getNetwork').mockReturnValue(mockNetwork);

      // C -> D is a highway. If we try to go A -> C -> D, it should avoid it.
      const result = routeService.optimize('test-id', {
        originNodeId: 'A',
        destinationNodeId: 'F',
        constraints: { avoidHighways: true }
      });

      // Normal shortest to F: A -> C (5) -> D (12) -> F (4) = 21 (uses highway)
      // Normal fastest to F: A -> B (10) -> D (8) -> F (4) = 22 (no highway)
      // If we avoid highway, we must take A -> B -> D -> F.
      expect(result.totalCost).toBe(22);
      expect(result.path).toEqual(['A', 'B', 'D', 'F']);
    });

    it('should throw BadRequestException if origin is invalid', () => {
      jest.spyOn(networkService, 'getNetwork').mockReturnValue(mockNetwork);

      expect(() => {
        routeService.optimize('test-id', { originNodeId: 'Z', destinationNodeId: 'A' });
      }).toThrow(BadRequestException);
    });

    it('should throw NotFoundException if path is unreachable', () => {
      const unreachableNetwork = {
        id: 'unreachable-id',
        nodes: ['A', 'B', 'C'],
        edges: [
          { from: 'A', to: 'B', cost: 10 }
        ]
      };
      jest.spyOn(networkService, 'getNetwork').mockReturnValue(unreachableNetwork);

      expect(() => {
        routeService.optimize('unreachable-id', { originNodeId: 'A', destinationNodeId: 'C' });
      }).toThrow(NotFoundException);
    });
  });
});
