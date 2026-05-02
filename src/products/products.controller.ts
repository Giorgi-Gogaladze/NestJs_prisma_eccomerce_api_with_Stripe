import { Body, Controller, Delete, Get, HttpStatus, Ip, Param, ParseFilePipeBuilder, Patch, Post, Query, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { CreateProductDto } from './dtos/create_product.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AtGuard } from '../guards/at.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../custom_decorators/roles.decorator';
import { Product } from '@prisma/client';
import { UpdateProductDto } from './dtos/update_product.dto';
import { QueryDto } from './dtos/query.dto';
import { Public } from '../custom_decorators/public.decorator';
import { User } from '../custom_decorators/user.decorator';
import { ChangeStatusDto } from './dtos/change_status.dto';

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



  @Get()
  @Public()
  async getAllProducts(
    @Query() queryDto: QueryDto,
    @User() user: any,
  ): Promise<Product[]> {
    const isAdmin = Boolean(user?.role?.includes('ADMIN'));
    return await this.productsService.getAllProducts(queryDto, isAdmin);
  }


  @Get(':id')
  @Public()
  async getProductbyid(
    @Param('id') id: string,
    @User() user: any,
    @Ip() Ip: string
  ): Promise<Product>{
    const isAdmin = Boolean(user?.role?.includes('ADMIN'));
    return await this.productsService.getProductById(id, Ip, isAdmin);
  }

  @Patch('status/:id')
  async changeProductStatus(
    @Param('id') id: string,
    @Body() dto: ChangeStatusDto
  ): Promise<Product>{
    return await this.productsService.changeIsActiveStatus(id, dto);
  }


}
