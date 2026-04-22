import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { CategoriesService, categoryWithChildren } from './categories.service';
import { CreateCategoryDto } from './dtos/create_category.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Category } from '@prisma/client';
import { UpdateCategoryDto } from './dtos/update_category.dto';
import { AtGuard } from '../guards/at.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../custom_decorators/roles.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}


  @Get()
  async getAllCategories(): Promise<categoryWithChildren[]>{
    return await this.categoriesService.getAllCategories()
  }

  
  @UseGuards(AtGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async createCategory(
    @Body() dto: CreateCategoryDto,
    @UploadedFile() file: Express.Multer.File
  ): Promise<Category>{
    return await this.categoriesService.createCategory(dto, file)
  }


  @UseGuards(AtGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @UploadedFile() file: Express.Multer.File
  ): Promise<Category>{
    return await this.categoriesService.updateCategory(id, dto, file)
  }


  @UseGuards(AtGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  async deleteCategory(
    @Param('id') id: string
  ): Promise<{message: string}>{
    return await this.categoriesService.deleteCategory(id)
  }
  
}
