import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NetworkModule } from './network/network.module';
import { RouteModule } from './route/route.module';

@Module({
  imports: [NetworkModule, RouteModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
