import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dtos/create_coupon.dto';
import { Coupon } from '@prisma/client';
import { UpdateCouponDto } from './dtos/update_coupon.dto';
import { AtGuard } from '../guards/at.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../custom_decorators/roles.decorator';

@UseGuards(AtGuard, RolesGuard)
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Roles('ADMIN')
  @Get()
  async getAllCoupons(): Promise<Coupon[] | []>{
    return await this.couponsService.getAllCoupons()
  }

  @Roles('ADMIN')
  @Post()
  async createCoupon(
    @Body() dto: CreateCouponDto
  ): Promise<Coupon>{
    return await this.couponsService.createCoupon(dto);
  }


  @Roles('ADMIN')
  @Patch(':id')
  async updateCoupon(
    @Body() dto: UpdateCouponDto,
    @Param('id') id: string
  ): Promise<Coupon>{
    return await this.couponsService.updateCoupon(id, dto);
  }

  @Get(':code')
  async getCouponByCode(
    @Param('code') code: string
  ): Promise<Coupon>{
    return await this.couponsService.getCouponByCode(code);
  }

}
