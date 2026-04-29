import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CreateProductDto } from './dtos/create_product.dto';
import slugify from 'slugify'
import { UpdateProductDto } from './dtos/update_product.dto';
import { Product } from '@prisma/client';

//არ დამავიწყდეს: ისაქთივზე შევამოწმო სანამ დავაბრუნებ. და ისაქთივის შეცვლის ფუნქცია შევქმნა
 
@Injectable()
export class ProductsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cloudinaryService: CloudinaryService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache 
    ){}

    async createProduct(dto: CreateProductDto, files: Express.Multer.File[]){
        const product = await this.prisma.product.findFirst({
            where: {name: dto.name}
        });

        if(product){
            throw new ConflictException('Product with this anme already exist!');
        }

        const slug = slugify(dto.name, {
            lower: true,
            replacement: '-',
            strict: true
        });

        let productImages: {imageUrl: string, imagePublicId: string}[] = [];
        let thumbnail = null;
        let thumbKey = null;
        if(files && files.length > 0){
            const uploadRes = await Promise.all(
                files.map(file =>  this.cloudinaryService.uploadFile(file))
            );

            thumbnail = uploadRes[0].secure_url;
            thumbKey = uploadRes[0].public_id;

            productImages = uploadRes.map(res => ({
                imageUrl: res.secure_url,
                imagePublicId: res.public_id
            }))
        }



        const newProduct = await this.prisma.product.create({
            data: {
                name: dto.name,
                description: dto.description,
                slug: slug,
                basePrice: dto.basePrice,
                discountPercent: dto.discountPercent || 0,
                thumbnailUrl: thumbnail,
                thumbnailPublicId: thumbKey,
                isActive: dto.isActive ?? true,

                category: {connect: {id: dto.categoryId}},
                brand: {connect: {id: dto.brandId}},

                product_images: {
                    create: productImages
                }
            },
            include: {
                product_images: true,
                category: true,
                brand: true
            }

        });
        return newProduct;
    }



    async deleteProduct(id: string): Promise<{message: string}>{
        const product = await this.prisma.product.findUnique({
            where: {id}
        });

        if(!product){
            throw new NotFoundException(`Product with id ${id} not found`)
        }

        await this.cloudinaryService.deleteFile(product.thumbnailPublicId!);
        await this.prisma.product.delete({
            where: {id}
        })
        return {message: 'Product deleted successfully'}
    }



    async updateProduct(id: string, dto: UpdateProductDto, files: Express.Multer.File[]): Promise<Product>{
        const product = await this.prisma.product.findUnique({
            where: {id}
        });

        if(!product) throw new NotFoundException('Product not found');


        let newSlug: string | null = null;
        if(dto.name){
            newSlug = slugify(dto.name, {
                lower: true,
                strict:true,
                replacement: '-'
            });
        }

        let thumbnail: string | null = null;
        let thumbnailPublicId: string | null = null;
        let images: {imageUrl: string, imagePublicId: string}[] = [];

        if(files && files.length > 0){

            if(product.thumbnailPublicId){
                await this.cloudinaryService.deleteFile(product.thumbnailPublicId)
            }

            const uploadResult = await Promise.all(
                files.map(file => this.cloudinaryService.uploadFile(file))
            );
            
            thumbnail = uploadResult[0].secure_url;
            thumbnailPublicId = uploadResult[0].public_id;

            images = uploadResult.map(res => ({
                imageUrl: res.secure_url,
                imagePublicId: res.public_id
            }));
        }

        const updatedProduct = await this.prisma.product.update({
            where: {id},
            data: {
                ...(dto.name && {name: dto.name}),
                ...(newSlug && {slug: newSlug}),
                ...(dto.basePrice !== undefined && {basePrice: dto.basePrice}),
                ...(dto.description && {description: dto.description}),
                ...(dto.discountPercent !== undefined && {discountPercent: dto.discountPercent}),
                ...(dto.isActive && {isActive: dto.isActive}),
                ...(thumbnail && {thumbnailUrl: thumbnail}),
                ...(thumbnailPublicId && {thumbnailPublicId: thumbnailPublicId}),
                ...(images.length > 0 && {product_images: {create: images}})
            },
            include: {
                product_images: true,
                category: true,
                brand: true
            }
        });

        return updatedProduct;
    }

}
