import { Controller, Post, Body, Param } from '@nestjs/common';
import { RouteService } from './route.service';
import { OptimizeRouteDto } from './dto/optimize-route.dto';
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';

@ApiTags('Route')
@Controller('route')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Post('optimize/:id')
  @ApiOperation({ summary: 'Calculates the optimal path between two points' })
  @ApiParam({ name: 'id', description: 'The network graph ID' })
  @ApiResponse({ status: 201, description: 'The optimal route.', schema: { example: { graphId: 'uuid-123', totalCost: 25.5, path: ['A', 'C', 'D', 'E'], durationMs: 4 } } })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  optimize(@Param('id') id: string, @Body() optimizeRouteDto: OptimizeRouteDto) {
    return this.routeService.optimize(id, optimizeRouteDto);
  }
}
