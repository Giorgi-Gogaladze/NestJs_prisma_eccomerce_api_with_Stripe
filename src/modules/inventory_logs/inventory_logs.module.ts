import { Module } from '@nestjs/common';
import { InventoryLogsService } from './inventory_logs.service';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { InventoryLogsController } from './inventory_logs.controller';

@Module({
  imports: [PrismaModule],
  providers: [InventoryLogsService],
  exports: [InventoryLogsService],
  controllers: [InventoryLogsController]
})
export class InventoryLogsModule {}
