import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { InventoryChangeReason, Prisma } from '@prisma/client';
import { realpath } from 'fs';

@Injectable()
export class InventoryLogsService {
 constructor(private readonly prisma: PrismaService){}

 private async logStockchange(
  tsx: Prisma.TransactionClient,
  variantId: string,
  amount: number,
  reason: InventoryChangeReason,
  orderId?: string
 ){
  const updated = await tsx.productVariant.update({
    where: {id: variantId},
    data: { stock: {increment: amount}}
  });

  return await tsx.inventoryLog.create({
    data: {
      variantId,
      changeAmount: amount,
      reason,
      resultingStock: updated.stock,
      orderId
    }
  })
 }


  async recordCancellation(tsx: Prisma.TransactionClient, variantId: string, quantity: number, orderId: string){
    return await this.logStockchange(tsx, variantId, quantity, InventoryChangeReason.CANCELLATION, orderId)
  }

  async recordSale(tsx: Prisma.TransactionClient, variantId: string, quantity: number, orderId: string) {
    return await this.logStockchange(tsx, variantId, -quantity, InventoryChangeReason.SALE, orderId); 
  }

  async restock(tsx: Prisma.TransactionClient, variantId: string, quantity: number){
    return await this.logStockchange(tsx, variantId, quantity, InventoryChangeReason.RESTOCK)
  }

}
