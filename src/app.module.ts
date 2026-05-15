import "dotenv/config";  //ეს და ამის მაღლა(თავში) დაწერა უზრუნველყობს,  რომ ნებისმიერ სხვა ფაილში, process.env ხელმისაწვდომი იყოს ნებისმიერ სხვა ფაილში
import { Module } from '@nestjs/common';
import { AuthModule } from './modules/users/auth/auth.module';
import { AddressesModule } from './modules/users/addresses/addresses.module';
import { CategoriesModule } from './modules/catalog/categories/categories.module';
import { CloudinaryModule } from "./shared/cloudinary/cloudinary.module";
import { CouponsModule } from './modules/engagements/coupons/coupons.module';
import { CacheModule } from '@nestjs/cache-manager'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { redisStore } from 'cache-manager-redis-yet'
import { AttributesModule } from './modules/catalog/attributes/attributes.module';
import { BrandsModule } from './modules/catalog/brands/brands.module';
import { ProductsModule } from './modules/catalog/products/products.module';
import { ScheduleModule } from "@nestjs/schedule";
import { ViewsModule } from "./modules/engagements/views/views.module";
import { ReviewsModule } from './modules/users/reviews/reviews.module';
import { AttributeValuesModule } from './modules/catalog/attribute_values/attribute_values.module';
import { ProductVariantsModule } from './modules/catalog/product_variants/product_variants.module';
import { PrismaModule } from './shared/prisma/prisma.module';
import { FavoritesModule } from './modules/users/favorites/favorites.module';
import { CartModule } from './modules/cart_orders/cart/cart.module';
import { OrdersModule } from './modules/cart_orders/orders/orders.module';
import { InventoryLogsModule } from './modules/inventory_logs/inventory_logs.module';

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
  }),   PrismaModule,  AuthModule, AddressesModule, CategoriesModule, CloudinaryModule, CouponsModule, AttributesModule,  BrandsModule, ProductsModule, ViewsModule, 
  ScheduleModule.forRoot(), ReviewsModule, AttributeValuesModule, ProductVariantsModule, FavoritesModule, CartModule, OrdersModule, InventoryLogsModule
],
  controllers: [],
  providers: [],
})
export class AppModule {}
