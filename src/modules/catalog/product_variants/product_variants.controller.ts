import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProductVariantsService } from './product_variants.service';
import { createProductVariantDto } from './dtos/create_product_variant.dto';
import { UpdateProductVariantDto } from './dtos/update_product_vaiant.dto';
import { AtGuard } from '../../../shared/guards/at.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/custom_decorators/roles.decorator';
import { ProductVariant, Role } from '@prisma/client';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { RestockDto } from './dtos/restock.dto';

@Controller('product-variants')
@UseInterceptors(CacheInterceptor)
@UseGuards(AtGuard, RolesGuard)
export class ProductVariantsController {
  constructor(private readonly productVariantsService: ProductVariantsService) {}

  @Post(':productId')
  @Roles('ADMIN')
  async createProductVariant(
    @Body() dto: createProductVariantDto,
    @Param('productId') productId: string
  ){
    return await this.productVariantsService.createProductVariant(productId, dto);
  }

  @Get(':variantId')
  async getVariantById(
    @Param('variantId') variantId: string
  ): Promise<ProductVariant> {
    return await this.productVariantsService.getVariantById(variantId);
  }

  @Get('product/:productId')
  async getProductAllVariants(
    @Param('productId') productId: string
  ) {
    return await this.productVariantsService.getProductAllVariants(productId);
  } 

  @Roles(Role.ADMIN)
  @Patch('restock/:variantId')
  async restock(
    @Param('variantId') variantId: string,
    @Body() dto: RestockDto
  ){
    return await this.productVariantsService.restockVariant(variantId, dto)
  }

  @Patch(':variantId')
  @Roles(Role.ADMIN)
  async updateVariant(
    @Param('variantId') variantId: string,
    @Body() dto: UpdateProductVariantDto
  ) {
    return await this.productVariantsService.updateVariant(variantId, dto);
  }

  @Delete(':variantId')
  @Roles(Role.ADMIN)
  async deleteVariant(
    @Param('variantId') variantId: string
  ): Promise<{ message: string }> {
    return await this.productVariantsService.deleteVariant(variantId);
  }
}
