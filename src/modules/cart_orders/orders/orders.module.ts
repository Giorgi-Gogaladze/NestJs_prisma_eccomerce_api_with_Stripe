import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaModule } from '../../../shared/prisma/prisma.module';
import { CartModule } from '../cart/cart.module';
import { InventoryLogsModule } from '../../inventory_logs/inventory_logs.module';

@Module({
  imports: [PrismaModule, CartModule, InventoryLogsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
