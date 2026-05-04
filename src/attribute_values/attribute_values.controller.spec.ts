import { Test, TestingModule } from '@nestjs/testing';
import { AttributeValuesController } from './attribute_values.controller';
import { AttributeValuesService } from './attribute_values.service';

describe('AttributeValuesController', () => {
  let controller: AttributeValuesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttributeValuesController],
      providers: [AttributeValuesService],
    }).compile();

    controller = module.get<AttributeValuesController>(AttributeValuesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
