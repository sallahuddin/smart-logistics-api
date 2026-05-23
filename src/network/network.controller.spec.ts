import { Test, TestingModule } from '@nestjs/testing';
import { NetworkController } from './network.controller';
import { NetworkService } from './network.service';

describe('NetworkController', () => {
  let controller: NetworkController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NetworkController],
      providers: [
        {
          provide: NetworkService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<NetworkController>(NetworkController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
