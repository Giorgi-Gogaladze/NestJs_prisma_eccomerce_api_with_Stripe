import { Module } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { AddressesController } from './addresses.controller';
import { PrismaModule } from '../../../shared/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AddressesController],
  providers: [AddressesService],
})
export class AddressesModule {}
