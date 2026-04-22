import { Body, Controller, Delete, Get, HttpStatus, Param, ParseFilePipeBuilder, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
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
  @UseInterceptors(FileInterceptor('thumbnailUrl'))
  async createCategory(
    @Body() dto: CreateCategoryDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
      .addFileTypeValidator({
        fileType: /(jpg|jpeg|png|webp)$/
      })
      .addMaxSizeValidator({
        maxSize: 2 * 1024 * 1024
      })
      .build({
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
      }),
    )
    thumbnailUrl: Express.Multer.File
  ): Promise<Category>{
    return await this.categoriesService.createCategory(dto, thumbnailUrl)
  }


  @UseGuards(AtGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  @UseInterceptors(FileInterceptor('thumbnailUrl'))
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
      .addFileTypeValidator({
        fileType: /(jpg|jpeg|png|webp)$/
      })
      .addMaxSizeValidator({
        maxSize: 2 * 1024 * 1024
      })
      .build({
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
      }),
    ) thumbnailUrl: Express.Multer.File
  ): Promise<Category>{
    return await this.categoriesService.updateCategory(id, dto, thumbnailUrl)
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
