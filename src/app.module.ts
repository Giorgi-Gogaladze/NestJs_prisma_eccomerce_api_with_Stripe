import "dotenv/config";
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AddressesModule } from './addresses/addresses.module';
import { CategoriesModule } from './categories/categories.module';
import { CloudinaryModule } from "./cloudinary/cloudinary.module";
import { CouponsModule } from './coupons/coupons.module';


@Module({
  imports: [AuthModule, AddressesModule, CategoriesModule, CloudinaryModule, CouponsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
