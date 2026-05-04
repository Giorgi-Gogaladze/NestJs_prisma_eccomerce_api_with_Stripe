import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createAttValueDto } from './dtos/create_att_value.dto';
import { updateAttValueDto } from './dtos/update_att_value.dto';
import { AttributeValue } from '@prisma/client';
import { AttributesWithValues } from '../attributes/attributes.service';


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

    async deleteAttValue(attributeValId: string): Promise<{message: string}>{
        try {
            await this.prisma.attributeValue.delete({
                where: {id: attributeValId}
            });
            return { message: 'Attribute value deleted successfully' };
        } catch (error: any) {
            if(error.code === 'P2025'){
                throw new NotFoundException(`Attribute value with ID ${attributeValId} not found`);
            } 
            if (error.code === 'P2003') {
            throw new ConflictException(
                'Cannot delete this value because it is currently assigned to one or more product variants.'
            );
        }
        throw new InternalServerErrorException('Unexpected internal error')
        }
    }


    async getAttributeValues(attributeId: string): Promise<AttributesWithValues>{
        const att = await this.prisma.attribute.findUnique({ 
            where: {id: attributeId},
            include: {
                attribute_values: true
            }
        });

        if(!att) throw new NotFoundException('Attribtue not found');

        return att;
    }
}
