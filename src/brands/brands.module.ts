import { Module } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { BrandsController } from './brands.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [CloudinaryModule],
  controllers: [BrandsController],
  providers: [BrandsService, PrismaService],
})
export class BrandsModule {}
