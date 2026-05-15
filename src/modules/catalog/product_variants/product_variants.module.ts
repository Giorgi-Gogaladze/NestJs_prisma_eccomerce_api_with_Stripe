import { Module } from '@nestjs/common';
import { ProductVariantsService } from './product_variants.service';
import { ProductVariantsController } from './product_variants.controller';
import { PrismaModule } from '../../../shared/prisma/prisma.module';
import { InventoryLogsModule } from '../../inventory_logs/inventory_logs.module';

@Module({
  imports: [PrismaModule, InventoryLogsModule],
  controllers: [ProductVariantsController],
  providers: [ProductVariantsService],
})
export class ProductVariantsModule {}
