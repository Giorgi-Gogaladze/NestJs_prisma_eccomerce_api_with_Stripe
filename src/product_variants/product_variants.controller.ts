import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ProductVariantsService, ProductWithVariants } from './product_variants.service';
import { createProductVariantDto } from './dtos/create_product_variant.dto';
import { UpdateProductVariantDto } from './dtos/update_product_vaiant.dto';
import { AtGuard } from '../guards/at.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../custom_decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('product-variants')
@UseGuards(AtGuard, RolesGuard)
export class ProductVariantsController {
  constructor(private readonly productVariantsService: ProductVariantsService) {}

  @Post(':productId')
  @Roles('ADMIN')
  async createProductVariant(
    @Body() dto: createProductVariantDto,
    @Param('productId') productId: string
  ): Promise<ProductWithVariants> {
    return await this.productVariantsService.createProductVariant(productId, dto);
  }

  @Get(':variantId')
  async getVariantById(
    @Param('variantId') variantId: string
  ): Promise<ProductWithVariants> {
    return await this.productVariantsService.getVariantById(variantId);
  }

  @Patch(':variantId')
  @Roles(Role.ADMIN)
  async updateVariant(
    @Param('variantId') variantId: string,
    @Body() dto: UpdateProductVariantDto
  ): Promise<ProductWithVariants> {
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
