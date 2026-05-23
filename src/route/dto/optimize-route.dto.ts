import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum OptimizationPreference {
  SHORTEST = 'shortest',
  FASTEST = 'fastest',
}

export class RouteConstraintsDto {
  @ApiProperty({ example: true, required: false, description: 'If true, ignores edges marked as highways' })
  @IsOptional()
  @IsBoolean()
  avoidHighways?: boolean;
}

export class OptimizeRouteDto {
  @ApiProperty({ example: 'A' })
  @IsString()
  originNodeId: string;

  @ApiProperty({ example: 'E' })
  @IsString()
  destinationNodeId: string;

  @ApiProperty({ enum: OptimizationPreference, required: false, example: 'shortest' })
  @IsOptional()
  @IsEnum(OptimizationPreference)
  preference?: OptimizationPreference;

  @ApiProperty({ required: false, type: RouteConstraintsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => RouteConstraintsDto)
  constraints?: RouteConstraintsDto;
}
