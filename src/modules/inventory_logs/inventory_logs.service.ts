import { Inject, Injectable } from '@nestjs/common';
import { InventoryChangeReason, Prisma } from '@prisma/client';
import { LogsQueryDto } from './dtos/logs_query.dto';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import Redis from 'ioredis';

//ქეშეირება არ დამავიწყდეს!!!!!!!!!!


@Injectable()
export class InventoryLogsService {
  private redis: Redis;
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ){
    const store = this.cacheManager.stores[0];
    this.redis = (store as any).opts.store.client;
  }

  private async clearLogsCache(){
    const keys = await this.redis.keys(`inventory_logs:*`);

    if(keys.length > 0){
      await this.redis.del(...keys)
    }
  }



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

  await this.clearLogsCache();

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
    const cacheKey = `inventory_logs:${JSON.stringify(dto)}`;

    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) return cachedData;

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

     const res = {
      data: logs, 
      meta: {
        total,
        page, 
        lastPage: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1
      }
     };

     await this.cacheManager.set(cacheKey, res, 600);
     return res;
  }

}
