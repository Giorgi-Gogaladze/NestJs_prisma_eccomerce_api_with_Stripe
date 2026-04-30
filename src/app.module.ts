import "dotenv/config";  //ეს და ამის მაღლა(თავში) დაწერა უზრუნველყობს,  რომ ნებისმიერ სხვა ფაილში, process.env ხელმისაწვდომი იყოს ნებისმიერ სხვა ფაილში
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AddressesModule } from './addresses/addresses.module';
import { CategoriesModule } from './categories/categories.module';
import { CloudinaryModule } from "./cloudinary/cloudinary.module";
import { CouponsModule } from './coupons/coupons.module';
import { CacheModule } from '@nestjs/cache-manager'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { redisStore } from 'cache-manager-redis-yet'
import { AttributesModule } from './attributes/attributes.module';
import { BrandsModule } from './brands/brands.module';
import { ProductsModule } from './products/products.module';
import { ScheduleModule } from "@nestjs/schedule";
import { ViewsModule } from "./views/views.module";


@Module({
  imports: [
  ConfigModule.forRoot({isGlobal: true}), //.env_სთვის()
  CacheModule.registerAsync({
    isGlobal: true,
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService) => {
      const store = await redisStore({
        url: configService.get('REDIS_URL'),  //.env_დან
        ttl: 600
      });
      return {
        store: store as any
      }
    },
    inject: [ConfigService]
  }), 
  AuthModule, AddressesModule, CategoriesModule, CloudinaryModule, CouponsModule, AttributesModule,  BrandsModule, ProductsModule, ViewsModule, 
  ScheduleModule.forRoot(),
],
  controllers: [],
  providers: [],
})
export class AppModule {}
