import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttributeDto } from './dots/create_attribute.dto';
import { Attribute } from '@prisma/client';
import { UpdateAddressDto } from '../addresses/dtos/update_address.dto';
import { UpdateAttributeDto } from './dots/update_attribute.dto';

@Injectable()
export class AttributesService {
    constructor(private readonly prisma: PrismaService){}

    async createAttribute(dto: CreateAttributeDto): Promise<Attribute>{
        const existingAtt = await this.prisma.attribute.findUnique({
            where: {name: dto.name}
        });

        if(existingAtt){
            throw new ConflictException('Attribute already exists');
        }

        return await this.prisma.attribute.create({ data: dto})
    }


    async updateAttribute(id: string, dto: UpdateAttributeDto): Promise<Attribute>{
        const att = await this.prisma.attribute.findUnique({
            where: {id}
        });

        if(!att){
            throw new NotFoundException('Attribute not found');
        }

        return await this.prisma.attribute.update({
            where: {id},
            data: dto
        })
    }


    async getAttributes(): Promise<Attribute[] | []>{
        return await this.prisma.attribute.findMany();
    }



    
}
