import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { CreateProductDto } from './dtos/create_product.dto';
import slugify from 'slugify'
import { UpdateProductDto } from './dtos/update_product.dto';
import { Prisma, Product } from '@prisma/client';
import { QueryDto } from './dtos/query.dto';
import { ViewsService } from '../views/views.service';
import { ChangeStatusDto } from './dtos/change_status.dto';

//არ დამავიწყდეს: ისაქთივზე შევამოწმო სანამ დავაბრუნებ. და ისაქთივის შეცვლის ფუნქცია შევქმნა
//არ დამავიწყდეს ნახვების გაზრდის ლოგიკა
 
@Injectable()
export class ProductsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cloudinaryService: CloudinaryService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private viewsService: ViewsService
    ){}


    private async clearCache(){
        await this.cacheManager.clear()
    }


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
        await this.clearCache()
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
        await this.clearCache();
        return {message: 'Product deleted successfully'}
    }



    async updateProduct(id: string, dto: UpdateProductDto, files?: Express.Multer.File[]): Promise<Product>{
        const [currentProduct, existingProduct] = await Promise.all([
            this.prisma.product.findUnique({ where: { id } }),
            dto.name ? this.prisma.product.findFirst({ where: { name: dto.name } }) : Promise.resolve(null),
        ]);

        if (!currentProduct) {
            throw new NotFoundException(`Product with id ${id} not found`);
        }

        if (existingProduct && existingProduct.id !== id) {
            throw new ConflictException(`Product with name ${dto.name} already exist `);
        }

        if (dto.brandId) {
            const brand = await this.prisma.brand.findUnique({ where: { id: dto.brandId } });
            if (!brand) throw new NotFoundException('Brand not found');
        }

        if (dto.categoryId) {
            const category = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
            if (!category) throw new NotFoundException('Category not found');
        }

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

            if (currentProduct.thumbnailPublicId) {
                deleteOldImages.push(this.cloudinaryService.deleteFile(currentProduct.thumbnailPublicId));
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
                ...(dto.isActive !== undefined && {isActive: dto.isActive}),
                ...(dto.brandId && {brand: { connect: { id: dto.brandId } }}),
                ...(dto.categoryId && {category: { connect: { id: dto.categoryId } }}),
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
        await this.clearCache()
        return updatedProduct;
    }



    async getAllProducts(queryDto: QueryDto, isAdmin: boolean){
        const {brand, category, limit = 10, maxPrice, minPrice, page = 1, search, sortBy = 'createdAt', sortOrder = 'asc'} = queryDto;

        const cacheKey = `products:${isAdmin ? 'admin' : 'user'}:${search}-${category}-${brand}-${minPrice}-${maxPrice}-${page}-${limit}-${sortBy}-${sortOrder}`;
        const cachedProducts = await this.cacheManager.get<Product[]>(cacheKey);
        if(cachedProducts) return cachedProducts as Product[];


        const where: Prisma.ProductWhereInput = isAdmin ? {} : {isActive: true};

        if(search){
            where.OR = [
                {name: {contains: search, mode: 'insensitive'}},
                {description: {contains: search, mode: 'insensitive'}},
            ];
        }

        if(category){
            where.category = {
                OR: [
                    {id: category.match(/^[0-9a-fA-F-]{36}$/) ? category: undefined},
                    {slug: category},
                ].filter(Boolean)
            }
        };

        if(brand){
            where.brand = {
                OR: [
                    { id: brand.match(/^[0-9a-fA-F-]{36}$/) ? brand : undefined },
                    { slug: brand }
                ].filter(Boolean)
            }
        };

        if(minPrice !== undefined || maxPrice !== undefined){
            where.basePrice = {
                ...(minPrice !== undefined && {gte: Number(minPrice)}),
                ...(maxPrice !== undefined && {lte: Number(maxPrice)}),
            }
        }

        const skip = (page - 1) * limit;


        const [products, total ]  = await Promise.all([
            this.prisma.product.findMany({
                where,
                include: {
                    brand: {select: {name: true}},
                    category: {select: {name: true}},
                    product_images: {
                        take: 1
                    },
                    _count: {
                        select: {reviews: true}
                    }
                },
                orderBy: {
                    [sortBy]: sortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc'   
                },
                skip: skip,
                take: limit
            }),
            this.prisma.product.count({where})
        ]);

        await this.cacheManager.set(cacheKey, products, 3600);

        return {
            data: products,
            meta: {
                totalCount: total,
                page,
                limit,
                hasNextPage: skip + products.length < total
            }
        };

    }


    async getProductById(id:string, ip: string, isAdmin: boolean): Promise<Product>{
        const product = await this.prisma.product.findUnique({
            where: {
                id, 
                ...(isAdmin ? {} : {isActive: true})
            },
            include: {
                brand: true,
                category: true,
                product_images: true,
                reviews: {take: 5, orderBy: {createdAt: 'desc'}},
            }
        });

        if(!product) throw new NotFoundException('Product not found or is not in active status');

        if(!isAdmin){
            this.viewsService.incrementView(id, ip);
        }

        return product;
    }


    async changeIsActiveStatus(id: string, dto: ChangeStatusDto): Promise<Product>{
        const { isActive } = dto;
        try {
            return await this.prisma.product.update({
                where: {id},
                data: {isActive}
            })
        } catch (error: any) {
            if(error.code === 'P2025'){
                throw new NotFoundException('Product not found');
            }
            throw error;
        }
    }

}
