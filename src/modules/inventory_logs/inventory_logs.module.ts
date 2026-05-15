import { Module } from '@nestjs/common';
import { InventoryLogsService } from './inventory_logs.service';
import { PrismaModule } from '../../shared/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [InventoryLogsService],
  exports: [InventoryLogsService]
})
export class InventoryLogsModule {}
