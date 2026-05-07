import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager";
import { Inject, Injectable, Logger, ParseIntPipe } from "@nestjs/common";
import { Redis } from 'ioredis'
import { PrismaService } from "../prisma/prisma.service";
import { Cron, CronExpression } from "@nestjs/schedule";


//ScheduleModule აპმოდულში დავერეგისტრირე, არ დამავიწყდეს, რომ იქაც შევხედო.

@Injectable()
export class ViewsService{
    private readonly logger = new Logger(ViewsService.name);
    private redis: Redis;

    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private prisma: PrismaService
    ){
        const store = this.cacheManager.stores[0];
        this.redis = (store as any).opts.store.client;    // ვიღებთ Redis კლიენტს cache-manager-იდან
    }


    async incrementView(productId: string, ip: string){
        const lockKey = `product:views:${productId}:${ip}`;
        try {
            //ვამოწმებთ ხო არ არის ასეთი ბოქლომი რედისში
            const isLocked = this.redis.get(lockKey);

            if(!isLocked){
                const key = `product:views:${productId}`;
                await this.redis.incr(key);  //ვზრდით რაოდენობას


                // 4. ვადებთ ბოქლომს, მაგალითად 1 საათით
                // 'EX' ნიშნავს Expiration-ს, 3600 არის წამები.
                await this.redis.set(lockKey, 'true', 'EX', 3600);
                
                this.logger.log(`View counted for product ${productId} from IP ${ip}`);
            }else{
               // თუ ბოქლომი არსებობს, არაფერს ვაკეთებთ
               this.logger.debug(`Duplicate view ignored for product ${productId} from IP ${ip}`);
            }


        } catch (error: any) {
            this.logger.error(`Failed to increment view for ${productId}`, error);
        }
    }


    //ვიყენებთ ქრონს ავტომატური სინქრონიზაციისთვის(რედისთან ერთად ვამუავებთ)
    @Cron(CronExpression.EVERY_10_MINUTES)
    async syncToDb(){

        // (ჩემთვის) ვიღებთ ყველა ქის, რომელიც ნახვებს ინახავს
        const keys = await this.redis.keys('product:views:*');

        if(keys.length === 0){
            this.logger.log('No new views to sync.');
            return;
        }

        for(const key of keys){
            const productId = key.split(':').pop();
            // getdel იღებს მნიშვნელობას და იმავე წამს შლის რეიდისიდან
            const count = await this.redis.getdel(key);

            if(count && productId){
                await this.prisma.product.update({
                    where: {id: productId},
                    data: {views: {increment: parseInt(count)}},
                })
            }
        }
    }
}