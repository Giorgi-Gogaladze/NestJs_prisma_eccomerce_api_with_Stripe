import { Body, Controller, HttpStatus, ParseFilePipeBuilder, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dtos/create_brand.dto';
import { Brand } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';

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



  
}
