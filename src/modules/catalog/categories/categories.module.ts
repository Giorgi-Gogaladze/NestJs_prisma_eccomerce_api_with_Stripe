import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { CloudinaryModule } from '../../../shared/cloudinary/cloudinary.module';
import { PrismaModule } from '../../../shared/prisma/prisma.module';

@Module({
  imports: [CloudinaryModule, PrismaModule],  //არ უნდა დამავიწყდეს, რომ შეძლოს ქლაუდინარის გამოყენება
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
