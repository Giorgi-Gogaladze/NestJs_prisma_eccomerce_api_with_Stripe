import "dotenv/config";
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AddressesModule } from './addresses/addresses.module';
import { CategoriesModule } from './categories/categories.module';
import { CloudinaryModule } from "./cloudinary/cloudinary.module";
import { CouponsModule } from './coupons/coupons.module';
import { CacheModule } from '@nestjs/cache-manager'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { redisStore } from 'cache-manager-redis-yet'


@Module({
  imports: [
  ConfigModule.forRoot({isGlobal: true}), //.env_სთვის()
  CacheModule.registerAsync({
    isGlobal: true,
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService) => {
      const store = await redisStore({
        url: configService.get('REDIS_URL'),  //.env_დან
        ttl: 600000
      });
      return {
        store: store as any
      }
    },
    inject: [ConfigService]
  }), 
  AuthModule, AddressesModule, CategoriesModule, CloudinaryModule, CouponsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
