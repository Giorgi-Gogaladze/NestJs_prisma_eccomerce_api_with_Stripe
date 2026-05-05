import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createProductVariantDto } from './dtos/create_product_variant.dto';

@Injectable()
export class ProductVariantsService {
    constructor(private readonly prisma: PrismaService){}

    async createProductVariant(productId: string, dto: createProductVariantDto){
        const ExistingVariants = await this.prisma.productVariant.findMany({
            where: { productId},
            include: { attribute_values: {select: {id: true}}} 
        });

        const isDuplicate = ExistingVariants.some((variant) => {
            const existingValuesId =variant.attribute_values.map(v => v.id);

            return (
                existingValuesId.length === dto.attributeValueIds.length && 
                existingValuesId.every((id) => dto.attributeValueIds.includes(id))
            )
        });

        if(isDuplicate) throw new ConflictException('A variant with these attribtue values already exist');

        return await this.prisma.productVariant.create({
            data: {
                sku: 'hello',
                price: dto.price,
                stock: dto.stock,
                productId,
                attribute_values: {
                    connect: dto.attributeValueIds.map((id) => ({ id }))
                }
            }
        })
    }

}
