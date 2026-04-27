import { Body, Controller, Delete, Get, HttpStatus, Param, ParseFilePipeBuilder, Patch, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dtos/create_brand.dto';
import { Brand } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateBrandDto } from './dtos/update_brand.dto';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('logoImg'))
  async createBrand( 
    @Body() dto: CreateBrandDto,
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
    logoImg: Express.Multer.File
  ): Promise<Brand>{
    return await this.brandsService.createBrand(dto, logoImg);
  }


  @Get()
  async getBrands(): Promise<Brand[] | []>{
    return await this.brandsService.getBrands();
  }


  @Patch(':id')
  @UseInterceptors(FileInterceptor('logoImg'))
  async updateBrand(
    @Param('id') id: string,
    @Body() dto: UpdateBrandDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
      .addFileTypeValidator({
        fileType: /(png|jpg|jpeg|webp)$/
      })
      .addMaxSizeValidator({
        maxSize: 2 * 1024 * 1024
      })
      .build({
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        fileIsRequired: false
      })
    )
    logoImg: Express.Multer.File
  ): Promise<Brand>{
    return await this.brandsService.updateBrand(id, dto, logoImg);
  }


  @Delete(':id')
  async deleteBrand(
    @Param('id') id: string
  ): Promise<{message: string}>{
    return await this.brandsService.deleteBrand(id);
  }



}
