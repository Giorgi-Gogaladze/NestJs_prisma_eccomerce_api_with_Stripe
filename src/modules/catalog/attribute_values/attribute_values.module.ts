import { Module } from '@nestjs/common';
import { AttributeValuesService } from './attribute_values.service';
import { AttributeValuesController } from './attribute_values.controller';
import { PrismaModule } from '../../../shared/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AttributeValuesController],
  providers: [AttributeValuesService],
})
export class AttributeValuesModule {}
