import { Body, Controller, Delete, HttpStatus, Param, ParseFilePipeBuilder, Patch, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { CreateProductDto } from './dtos/create_product.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AtGuard } from '../guards/at.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../custom_decorators/roles.decorator';
import { Product } from '@prisma/client';
import { UpdateProductDto } from './dtos/update_product.dto';

@UseGuards(AtGuard, RolesGuard)
@UseInterceptors(CacheInterceptor)
@Controller('products')
@Roles('ADMIN')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('product_images'))
  async createProduct(
    @Body() dto: CreateProductDto,
    @UploadedFiles(
      new ParseFilePipeBuilder()
      .addFileTypeValidator({
        fileType: /(jpg|jpeg|png|webp)$/
      })
      .addMaxSizeValidator({ 
        maxSize: 2 * 1024 * 1024
      })
      .build({
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        fileIsRequired: true
      }),
    )
    product_images: Express.Multer.File[]
  ): Promise<Product>{
    return await this.productsService.createProduct(dto, product_images)
  }


  @Delete(':id')
  async deleteProduct(
    @Param('id') id: string
  ): Promise<{message: string}>{
    return await this.productsService.deleteProduct(id);
  }


  @Patch(':id')
  @UseInterceptors(FilesInterceptor('product_images'))
  async updateProduct(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @UploadedFiles(
      new ParseFilePipeBuilder()
      .addFileTypeValidator({
        fileType: /(jpg|jpeg|png|webp)$/
      })
      .addMaxSizeValidator({
        maxSize: 2 * 1024 * 1024
      })
      .build({
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        fileIsRequired: false
      }),
    )
    product_images: Express.Multer.File[]
  ): Promise<Product>{
    return await this.productsService.updateProduct(id, dto, product_images);
  }





  ///კონტროლერ ფუნქციები დავწერო, მერე რევიუებში ფუნქციები და ცონტროლერ ფუნქიციები დავამატო
}
