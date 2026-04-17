import "dotenv/config";
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AddressesModule } from './addresses/addresses.module';


@Module({
  imports: [AuthModule, AddressesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
