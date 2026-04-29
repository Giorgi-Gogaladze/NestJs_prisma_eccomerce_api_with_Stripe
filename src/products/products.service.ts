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
        const [existingProduct, category, brand] =await Promise.all([
            this.prisma.product.findFirst({ where: {name: dto.name}}),
            this.prisma.category.findUnique({where: {id: dto.categoryId}}),
            this.prisma.brand.findUnique({where: {id: dto.brandId}})
        ]);
        
        if (existingProduct) throw new ConflictException('Product name already exists');
        if (!category) throw new NotFoundException('Category not found');
        if (!brand) throw new NotFoundException('Brand not found');

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
                product_images: { create: productImages }
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
            where: {id},
            include: {product_images: true}
        });

        if(!product){
            throw new NotFoundException(`Product with id ${id} not found`)
        }

        const publicIdstoDelete = product.product_images.map(img => img.imagePublicId);
        if(product.thumbnailPublicId){
            publicIdstoDelete.push(product.thumbnailPublicId);
        }

        if(publicIdstoDelete.length > 0){
            await Promise.all(
                publicIdstoDelete.map( id => this.cloudinaryService.deleteFile(id))
            )
        }

        await this.prisma.product.delete({
            where: {id}
        })
        return {message: 'Product deleted successfully'}
    }



    async updateProduct(id: string, dto: UpdateProductDto, files: Express.Multer.File[]): Promise<Product>{
        const [existingProduct, brand, category] = await Promise.all([
            this.prisma.product.findFirst({where: {name: dto.name}}),
            this.prisma.brand.findUnique({where: {id: dto.brandId}}),
            this.prisma.category.findUnique({where: {id: dto.categoryId}})
        ]);

        if(!existingProduct) throw new ConflictException(`Product with name ${dto.name} already exist `);
        if(!brand) throw new NotFoundException('Brand not found');
        if(!category) throw new NotFoundException('Category not found');


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

            const oldImages = await this.prisma.productImage.findMany({
                where: {productId: id}
            });

            const deleteOldImages = oldImages.map(img => 
                this.cloudinaryService.deleteFile(img.imagePublicId)
            );

            if(existingProduct.thumbnailPublicId){
                deleteOldImages.push(this.cloudinaryService.deleteFile(existingProduct.thumbnailPublicId));
            }

            await Promise.all(deleteOldImages);

            await this.prisma.productImage.deleteMany({
                where: {productId: id}
            })

            
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
