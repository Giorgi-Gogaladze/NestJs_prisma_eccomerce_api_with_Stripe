import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createProductVariantDto } from './dtos/create_product_variant.dto';
import { Prisma, ProductVariant } from '@prisma/client';
import { UpdateProductVariantDto } from './dtos/update_product_vaiant.dto';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

 export type ProductWithVariants = Prisma.ProductVariantGetPayload<{}>

@Injectable()
export class ProductVariantsService {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ){}

    private async invalidateProductCache(productId: string){
        await this.cacheManager.del(`product_${productId}`);
        await this.cacheManager.del(`prodict_variants_${productId}`);
        await this.cacheManager.del('all_products_list')
    }



    private generateSku(values: string[],  productName: string): string{
        const name = productName.slice(0, 3).toUpperCase();
        const valueParts = values.map((val) => {
           return val.replace(/\s+/g, '').slice(0, 5).toUpperCase()
        }).join('-');

        const randomSufix = Math.floor(1000 + Math.random() * 9000);
        return (`${name}-${valueParts}-${randomSufix}`).trim();
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

        if(isDuplicate) throw new ConflictException('A variant with these attribtue values already exist');

        const selectedValues = await this.prisma.attributeValue.findMany({
            where: {id: { in: dto.attributeValueIds}} 
        });
        const valNames = selectedValues.map(v => v.value).sort();

        const sku  = this.generateSku(valNames, product.name);

        await this.prisma.productVariant.create({
            data: {
                sku: sku,
                price: dto.price,
                stock: dto.stock,
                productId,
                attribute_values: {
                    connect: dto.attributeValueIds.map((id) => ({ id }))
                },
            }
        })
        await this.invalidateProductCache(productId);
        return await this.getProductById(productId);
    };



    async getVariantById(variantId: string): Promise<ProductVariant>{
        const cachekey = `variant_${variantId}`;

        const cachedVariant = await this.cacheManager.get<ProductVariant>(cachekey);
        if(cachedVariant) return cachedVariant;

        const variant = await this.prisma.productVariant.findUnique({
            where: {id: variantId},
            include: {
                product: true,
                attribute_values: {
                    include: {attribute: true}
                }
            }
        });

        if(!variant) throw new NotFoundException("Variant not found");

        await this.cacheManager.set(cachekey, variant, 3600);
        return variant;
    }


    async updateVariant(variantId: string, dto: UpdateProductVariantDto){
        const variant = await this.prisma.productVariant.findUnique({
            where: {id: variantId}
        });

        if(!variant) throw new NotFoundException('Variant not found');

        await this.prisma.productVariant.update({
            where: {id: variantId},
            data: { ...dto}
        });

        const updatedVarianta = await this.prisma.productVariant.findUnique({
            where: {id: variantId},
            include: {
                attribute_values: {
                    include: {attribute: true}
                }
            }
        });
        await this.invalidateProductCache(variant.productId);
        return updatedVarianta;
    }


    async getProductAllVariants(productId: string){
        const cachekey = `product_variants_${productId}`;

        const cachedVariants =await this.cacheManager.get(cachekey);
        if(cachedVariants) return cachedVariants;

        const res = await this.prisma.product.findMany({
            where: {id:productId},
            include: {
                product_variants: {
                    include: {
                        attribute_values:{
                            include: {attribute: true}
                        }
                    }
                }
            }
        });

        await this.cacheManager.set(cachekey, res, 3600);
        return res;
    }


    async deleteVariant(variantId: string): Promise<{message: string}>{
        const variant = await this.prisma.productVariant.findUnique({
            where: {id: variantId}
        });

        if(!variant) throw new NotFoundException('Variant not found');

        await this.prisma.productVariant.delete({
            where: {id: variantId}
        });

        await this.invalidateProductCache(variant.productId);
        return {
            message: 'Variant deleted successfully'
        }
    }


    private async getProductById(productId: string){
        return await this.prisma.product.findUnique({
            where: {id: productId},
            include: {
                product_variants: {
                    include: {
                        attribute_values: {
                            include: {attribute: true}
                        }   
                    }
                }
            }
    })        
}

}
