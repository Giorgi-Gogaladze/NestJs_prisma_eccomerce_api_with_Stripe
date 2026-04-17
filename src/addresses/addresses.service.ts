import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto } from './dtos/create_address.dto';
import { UpdateAddressDto } from './dtos/update_address.dto';

@Injectable()
export class AddressesService {
    constructor(
        private readonly prisma: PrismaService
    ){}

    async createAddress(userId: string, createAddressDto: CreateAddressDto){
        return await this.prisma.address.create({
            data: {
                ...createAddressDto,
                userId: userId
            }
        })
    }

    async updateAddress(userId: string, updateAddressDto: UpdateAddressDto){
        const {city, phoneNumber, street, zipCode} = updateAddressDto;

        const updateAddress: any = {};

        const user = await this.prisma.user.findUnique({
            where: {id: userId}
        });

        if(!user){
            throw new NotFoundException("User not found")
        }

        if(city && city !==user.email){
            updateAddress.city = city;
        }

        if(phoneNumber) updateAddress.phoneNumber = phoneNumber;
        if(street) updateAddress.street = street;
        if(zipCode) updateAddress.zipCode = zipCode;


        const updatedAddress = await this.prisma.address.update({
            where: {id: userId},
            data: updateAddress
        });

        return updatedAddress;
    }
    
}
