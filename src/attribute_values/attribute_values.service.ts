import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createAttValueDto } from './dtos/create_att_value.dto';
import { updateAttValueDto } from './dtos/update_att_value.dto';
import { AttributeValue } from '@prisma/client';

@Injectable()
export class AttributeValuesService {
    constructor(private readonly prisma: PrismaService){}

    async createAttValue(dto: createAttValueDto, attributeId: string): Promise<AttributeValue>{
        const existingAttVal = await this.prisma.attributeValue.findFirst({
            where: { 
                value: dto.value,
                attributeId
            }
        })
        if(existingAttVal) throw new ConflictException('Attribute Value already exist');

        return await this.prisma.attributeValue.create({
            data: { 
                value: dto.value,
                attributeId
            }
        })
    }

    async updateAttValue(attributeValId: string, dto: updateAttValueDto): Promise<AttributeValue>{
        const attribute = await this.prisma.attributeValue.findUnique({ where: { id: attributeValId }});
        if(!attribute) throw new NotFoundException('Attribute value not found');

        return await this.prisma.attributeValue.update({
            where: {
                id: attributeValId,
            },
            data: {...dto}
        })
    }
}
