import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CreateProductDto } from './dtos/create_product.dto';
import slugify from 'slugify'
import { Product } from '@prisma/client';
import { connect } from 'http2';

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
            )
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

        })
    }

}
