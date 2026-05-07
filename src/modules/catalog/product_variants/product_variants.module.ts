import { Module } from '@nestjs/common';
import { ProductVariantsService } from './product_variants.service';
import { ProductVariantsController } from './product_variants.controller';
import { PrismaModule } from '../../../shared/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProductVariantsController],
  providers: [ProductVariantsService],
})
export class ProductVariantsModule {}
