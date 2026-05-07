import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto } from './dtos/create_address.dto';
import { UpdateAddressDto } from './dtos/update_address.dto';
import { Address } from '@prisma/client';

@Injectable()
export class AddressesService {
    constructor(
        private readonly prisma: PrismaService
    ){}

    async createAddress(userId: string, createAddressDto: CreateAddressDto): Promise<Address>{

        const existingCount = await this.prisma.address.count({
            where: {userId} 
        });
        const isFirstAddress = existingCount === 0;
        const shouldBeDefault = isFirstAddress || createAddressDto.isDefault;

        return await this.prisma.$transaction(async (tx) => {
            if(shouldBeDefault){
                await tx.address.updateMany({
                    where: {userId, isDefault: true},
                    data: { isDefault: false },
                });
            };

            return tx.address.create({
                data: {
                    ...createAddressDto,
                    userId,
                    isDefault: shouldBeDefault,
                }
            })
        })
    }

    async updateAddress(addressId: string, userId: string, updateAddressDto: UpdateAddressDto): Promise<Address>{

        const address = await this.prisma.address.findFirst({
            where: {
                id: addressId,
                userId: userId
            }
        });

        if(!address) throw new NotFoundException('Address not found')


        return await this.prisma.address.update({
            where: {id: addressId},
            data: updateAddressDto
        });
    }



    async getAddresses(userId: string): Promise<Address[] | {message: string}>{
        const addresses = await this.prisma.address.findMany({
            where: {userId: userId},
        });

        if(addresses.length === 0){
            return {message: 'User sas not address'}
        } else{
            return addresses;
        }
    }

    

    async deleteAddress(addressId: string, userId: string){
        const address = await this.prisma.address.findFirst({
            where: {
                id: addressId,
                userId: userId
            }, 
        });
        if(!address){
            throw new NotFoundException('Address not found');
        };

        await this.prisma.address.delete({
            where: {id: addressId}
        });
         
        return {
            message: 'Address removed successfully',
        };
    }
    
    
}
