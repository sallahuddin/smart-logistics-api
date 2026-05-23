import { Module } from '@nestjs/common';
import { RouteService } from './route.service';
import { RouteController } from './route.controller';
import { NetworkModule } from '../network/network.module';

@Module({
  imports: [NetworkModule],
  controllers: [RouteController],
  providers: [RouteService],
})
export class RouteModule {}
