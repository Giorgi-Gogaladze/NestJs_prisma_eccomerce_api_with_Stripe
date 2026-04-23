import "dotenv/config";
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AddressesModule } from './addresses/addresses.module';
import { CategoriesModule } from './categories/categories.module';
import { CloudinaryModule } from "./cloudinary/cloudinary.module";
import { CouponsModule } from './coupons/coupons.module';
import { CacheModule } from '@nestjs/cache-manager'
import KeyvRedis from "@keyv/redis";


@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      stores: [
        new KeyvRedis('redis://localhost:6379'),
      ],
      ttl: 600000
    }),
    AuthModule, AddressesModule, CategoriesModule, CloudinaryModule, CouponsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
