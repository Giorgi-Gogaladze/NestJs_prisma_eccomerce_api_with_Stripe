import "dotenv/config";
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AddressesModule } from './addresses/addresses.module';
import { CategoriesModule } from './categories/categories.module';


@Module({
  imports: [AuthModule, AddressesModule, CategoriesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
