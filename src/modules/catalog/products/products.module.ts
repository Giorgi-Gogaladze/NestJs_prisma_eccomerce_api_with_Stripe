import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaModule } from '../../../shared/prisma/prisma.module';
import { CloudinaryModule } from '../../../shared/cloudinary/cloudinary.module';
import { ViewsModule } from '../../engagements/views/views.module';

@Module({
  imports: [CloudinaryModule, ViewsModule, PrismaModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
