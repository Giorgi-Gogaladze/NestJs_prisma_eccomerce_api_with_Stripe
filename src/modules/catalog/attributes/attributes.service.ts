import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttributeDto } from './dots/create_attribute.dto';
import { Attribute, Prisma } from '@prisma/client';
import { UpdateAttributeDto } from './dots/update_attribute.dto';

export type AttributesWithValues = Prisma.AttributeGetPayload<{
    include: {attribute_values: true}
}>

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

        if(dto.name){
            const duplicate = await this.prisma.attribute.findFirst({
                where: {name: dto.name, NOT: {id}}
            });

            if(duplicate) throw new ConflictException('Attribute name is already taken');
        }

        return await this.prisma.attribute.update({
            where: {id},
            data: dto
        })
    }


    async getAttributes(): Promise<AttributesWithValues[]>{
        return await this.prisma.attribute.findMany({
            include: {
                attribute_values:true
            }
        });
    }

    async getAttribute(id: string): Promise<AttributesWithValues>{
        const att = await this.prisma.attribute.findUnique({
            where: {id},
            include: {
                attribute_values: true
            }
        })
        if(!att) throw new NotFoundException('Attribute not found');

        return att
    }


    async deleteAttribute(id: string): Promise<{message: string}>{
        const att = await this.prisma.attribute.findUnique({
            where: {id},
            include: {_count: {select: {attribute_values: true}}}
        })

        if(!att){
            throw new NotFoundException('Attribute not found');
        }

        if (att._count.attribute_values > 0) {
            throw new BadRequestException('Cannot delete attribute that is in use by products');
        }
        
        await this.prisma.attribute.delete({ where: {id}});

        return {
            message: 'Attribute removed successfully'
        }
    }

    
}
