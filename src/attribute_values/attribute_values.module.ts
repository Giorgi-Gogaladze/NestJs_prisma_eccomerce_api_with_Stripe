import { Module } from '@nestjs/common';
import { AttributeValuesService } from './attribute_values.service';
import { AttributeValuesController } from './attribute_values.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [AttributeValuesController],
  providers: [AttributeValuesService, PrismaService],
})
export class AttributeValuesModule {}
