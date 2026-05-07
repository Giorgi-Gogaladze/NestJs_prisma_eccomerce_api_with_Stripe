import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCouponDto } from './dtos/create_coupon.dto';
import { Coupon } from '@prisma/client';
import { UpdateCouponDto } from './dtos/update_coupon.dto';

@Injectable()
export class CouponsService {
    constructor(private readonly prisma: PrismaService){}

    async createCoupon(dto: CreateCouponDto): Promise<Coupon>{
        if(new Date(dto.expiresAt) <= new Date()){
            throw new BadRequestException("Expiration date must be in the future");
        }

       try {
        return await this.prisma.coupon.create({data: dto })
       } catch (error: any) {
        if(error.code === 'P2002'){
            throw new ConflictException("Coupon with that code already exists");
        }
        throw error;
       }
    }


    async updateCoupon(id: string, dto: UpdateCouponDto): Promise<Coupon>{
        const coupon = await this.prisma.coupon.findUnique({
            where: {id}
        });

        if(!coupon) throw new NotFoundException("Coupon not found");

        
        if(dto.expiresAt && new Date(dto.expiresAt) <= new Date()){
            throw new  BadRequestException("Expiration date must be in the future");
        }

        return await this.prisma.coupon.update({
            where: {id},
            data: dto
        })
    }



    async getAllCoupons(): Promise<Coupon[] | []>{
        return await this.prisma.coupon.findMany();
    }


    async getCouponByCode(couponCode: string): Promise<Coupon>{
        const coupon = await this.prisma.coupon.findUnique({
            where: {code: couponCode}
        });
        
        if(!coupon) throw new NotFoundException('Coupon not found');

        return coupon;
    }


    async validateCoupon(couponCode: string){
        const coupon = await this.prisma.coupon.findUnique({
            where: {code: couponCode},
        });

        if(!coupon) throw new NotFoundException('Coupon not found');

        if(!coupon.isActive) throw new BadRequestException('Coupon is disabled');

        const now = new Date();
        const expiryDate  = new Date(coupon.expiresAt);

        if(now > expiryDate){
            throw new BadRequestException('Coupon has expired')
        }

        return coupon; 
    }


}
