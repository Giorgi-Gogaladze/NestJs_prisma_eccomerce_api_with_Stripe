import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCouponDto } from './dtos/create_coupon.dto';
import { Coupon } from '@prisma/client';
import { UpdateCouponDto } from './dtos/update_coupon.dto';

@Injectable()
export class CouponsService {
    constructor(private readonly prisma: PrismaService){}

    async createCoupon(dto: CreateCouponDto): Promise<Coupon>{
       const existingCoupon = await this.prisma.coupon.findUnique({
        where: { code: dto.code}
       });

       if(existingCoupon){
        throw new ConflictException("Coupon with that code already exist");
       }

       const expiryDate = new Date(dto.expiresAt);
       if(expiryDate <= new Date()){
        throw new BadRequestException("Expiration date must be in the future")
       }

       return await this.prisma.coupon.create({
        data: {...dto}
       })
    }

    
    async updateCoupon(id: string, dto: UpdateCouponDto): Promise<Coupon>{
        const coupon = await this.prisma.coupon.findUnique({
            where: {id}
        });

        if(!coupon) throw new NotFoundException("Coupon not found");

        return await this.prisma.coupon.update({
            where: {id},
            data: dto
        })
    }



}
