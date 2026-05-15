import { Injectable } from '@nestjs/common';
import { InventoryChangeReason, Prisma } from '@prisma/client';
import { LogsQueryDto } from './dtos/logs_query.dto';
import { PrismaService } from '../../shared/prisma/prisma.service';

//ქეშეირება არ დამავიწყდეს!!!!!!!!!!


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


  async getAllLogs(dto: LogsQueryDto){
     const {limit= 20, page = 1, search,  sortOrder = 'desc', reason} = dto;
     const skip = (page - 1) * limit;

     const where: Prisma.InventoryLogWhereInput = {
      AND: [
        reason ? { reason: reason as InventoryChangeReason } : {},
        search ? {
          OR: [
            {product_variant: {sku: {contains: search, mode: 'insensitive'}}},
            {product_variant: {product: {name: {contains: search, mode: 'insensitive'}}}},
            {order: {orderNumber: {contains: search, mode: 'insensitive'}}}
          ]
        } : {}
      ]
     };

     const [logs, total] = await Promise.all([
      this.prisma.inventoryLog.findMany({
        where,
        skip, 
        take: limit,
        orderBy: {createdAt: sortOrder},
        include: {
                product_variant: {
                    select: {
                        sku: true,
                        product: { select: { name: true } }
                    }
                },
                order: { select: { orderNumber: true } }
            }
      }),
      this.prisma.inventoryLog.count({where})
     ]);

     return {
      data: logs, 
      meta: {
        total,
        page, 
        lastPage: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1
      }
     }
  }

}
