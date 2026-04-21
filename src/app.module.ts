import "dotenv/config";
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AddressesModule } from './addresses/addresses.module';
import { CategoriesModule } from './categories/categories.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';


@Module({
  imports: [AuthModule, AddressesModule, CategoriesModule, CloudinaryModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
