import { Module } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { BrandsController } from './brands.controller';
import { CloudinaryModule } from '../../../shared/cloudinary/cloudinary.module';
import { PrismaModule } from '../../../shared/prisma/prisma.module';

@Module({
  imports: [CloudinaryModule, PrismaModule],
  controllers: [BrandsController],
  providers: [BrandsService],
})
export class BrandsModule {}
