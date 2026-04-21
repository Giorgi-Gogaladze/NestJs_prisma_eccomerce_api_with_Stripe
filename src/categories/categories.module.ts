import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  controllers: [CategoriesController, CloudinaryModule],  //რომ შეძლოს ქლაუდინარის გამოყენება(არ უნდა დამავიწყდეს)
  providers: [CategoriesService, PrismaService],
})
export class CategoriesModule {}
