import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { NetworkService } from './network.service';
import { UploadNetworkDto } from './dto/upload-network.dto';
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';

@ApiTags('Network')
@Controller('network')
export class NetworkController {
  constructor(private readonly networkService: NetworkService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Uploads a new graph definition (Nodes and Edges)' })
  @ApiResponse({ status: 201, description: 'The graph has been successfully uploaded.', schema: { example: { id: 'uuid-123' } } })
  upload(@Body() uploadNetworkDto: UploadNetworkDto) {
    return this.networkService.upload(uploadNetworkDto);
  }

  @Get('nodes/:id')
  @ApiOperation({ summary: 'Retrieves all defined nodes/locations for a specific network' })
  @ApiParam({ name: 'id', description: 'The network graph ID' })
  @ApiResponse({ status: 200, description: 'Array of node names.', schema: { example: ['A', 'B', 'C'] } })
  @ApiResponse({ status: 404, description: 'Network not found.' })
  getNodes(@Param('id') id: string) {
    return this.networkService.getNodes(id);
  }
}
