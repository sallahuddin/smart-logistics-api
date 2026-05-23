import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class EdgeDto {
  @ApiProperty({ example: 'A', description: 'The origin node of the edge' })
  @IsString()
  from: string;

  @ApiProperty({
    example: 'B',
    description: 'The destination node of the edge',
  })
  @IsString()
  to: string;

  @ApiProperty({ example: 10, description: 'The primary cost or distance' })
  @IsNumber()
  cost: number;

  @ApiProperty({
    example: 5,
    description: 'Optional time cost',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  time?: number;

  @ApiProperty({ example: false, description: 'Whether this edge represents a highway', required: false })
  @IsOptional()
  @IsBoolean()
  isHighway?: boolean;
}

export class UploadNetworkDto {
  @ApiProperty({ type: [EdgeDto], description: 'An array of edges representing the graph network' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EdgeDto)
  edges: EdgeDto[];
}
