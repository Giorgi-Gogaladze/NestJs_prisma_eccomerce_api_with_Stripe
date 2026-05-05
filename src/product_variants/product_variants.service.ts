import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createProductVariantDto } from './dtos/create_product_variant.dto';
import { Product } from '@prisma/client';

@Injectable()
export class ProductVariantsService {
    constructor(private readonly prisma: PrismaService){}



    private generateSku(values: string[],  productName: string): string{
        const name = productName.slice(0, 3).toUpperCase();
        const valueParts = values.map((val) => {
            val.replace(/\s+/g, '').slice(0, 5).toUpperCase()
        }).join('-');

        const randomSufix = Math.floor(1000 + Math.random() * 9000);

        return `${name}-${valueParts}-${randomSufix}`;
    }



    async createProductVariant(productId: string, dto: createProductVariantDto){
        const product = await this.prisma.product.findUnique({
            where: { id: productId},
            include: {
                product_variants: {
                    include: {attribute_values: {
                        select: {id: true}
                    }}
                }
             } 
        });
        if(!product) throw new ConflictException('Product not found');

        const isDuplicate = product.product_variants.some((variant) => {
            const existingValuesId =variant.attribute_values.map(v => v.id);

            return (
                existingValuesId.length === dto.attributeValueIds.length && 
                existingValuesId.every((id) => dto.attributeValueIds.includes(id))
            )
        });

        const selectedValues = await this.prisma.attributeValue.findMany({
            where: {id: { in: dto.attributeValueIds}} 
        });
        const valNames = selectedValues.map(v => v.value);

        const sku  = this.generateSku(valNames, product.name)


        if(isDuplicate) throw new ConflictException('A variant with these attribtue values already exist');

        return await this.prisma.productVariant.create({
            data: {
                sku: sku,
                price: dto.price,
                stock: dto.stock,
                productId,
                attribute_values: {
                    connect: dto.attributeValueIds.map((id) => ({ id }))
                }
            }
        })
    };


}
