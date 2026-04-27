import { BadRequestException, ConflictException, Injectable, NotFoundException, UploadedFile } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Brand } from '@prisma/client';
import { CreateBrandDto } from './dtos/create_brand.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import slugify from 'slugify'
import { UpdateBrandDto } from './dtos/update_brand.dto';

@Injectable()
export class BrandsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cloudinaryService: CloudinaryService
    ){}


    async createBrand(dto: CreateBrandDto, file: Express.Multer.File): Promise<Brand>{
        const existing = await this.prisma.brand.findUnique({
            where: {name: dto.name}
        });

        if(existing){
            throw new ConflictException('Brand already exist');
        }

        const logoSlug = slugify(dto.name, {
            lower: true,
            strict: true,
            replacement: '-'
        });

        let logoUrl = null;
        let logoPublicId = null;
        if(file){
            const uploadResult = await this.cloudinaryService.uploadFile(file);
            logoUrl = uploadResult.secure_url;
            logoPublicId = uploadResult.public_id;
        }

        const newbrand = await this.prisma.brand.create({
            data: {
                name: dto.name,
                slug: logoSlug,
                description: dto.description,
                isActive: dto.isActive ?? true,
                logoImg: logoUrl,
                logoPublicId: logoPublicId
            }
        });
        
        return newbrand;
    }



    async getBrands(): Promise<Brand[] | []>{
        return await this.prisma.brand.findMany();
    }



    async updateBrand(id: string, dto: UpdateBrandDto, file: Express.Multer.File): Promise<Brand>{
        const brand = await this.prisma.brand.findUnique({
            where: {id}
        });

        if(!brand) throw new NotFoundException('Brand not found');

        const updateData: Partial<Brand> = {...dto};

        if(dto.name){
            updateData.slug = slugify(dto.name, {
                lower: true,
                strict: true,
                replacement: '-'
            })
        }

        if(file){
            if(brand.logoPublicId){
                await this.cloudinaryService.deleteFile(brand.logoPublicId)
            }

            const uploadRes = await this.cloudinaryService.uploadFile(file);
            updateData.logoImg = uploadRes.secure_url;
            updateData.logoPublicId = uploadRes.public_id;
        }

        return await this.prisma.brand.update({
            where: {id},
            data: updateData
        })
    }


    async deleteBrand(id: string): Promise<{message: string}>{
        const brand = await this.prisma.brand.findUnique({
            where: {id},
            include: {_count: {select: {products: true}}}
        });

        if(!brand) throw new NotFoundException('Brand not found');

        if(brand._count.products > 0){
            throw new BadRequestException('Can not delete brand that is in use by products');
        }

        if(brand.logoImg){
            try {
                if(brand.logoPublicId){
                    await this.cloudinaryService.deleteFile(brand.logoPublicId)
                }
            } catch (error) {
                console.log('Cloudinary delete failed')
            }
        }

        await this.prisma.brand.delete({
            where: {id}
        });

        return {
            message: 'Brand deleted successfully!'
        }
    }
}
