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
        if(file){
            const uploadResult = this.cloudinaryService.uploadFile(file);
            logoUrl = (await uploadResult).secure_url;
        }

        const newbrand = await this.prisma.brand.create({
            data: {
                name: dto.name,
                slug: logoSlug,
                description: dto.description,
                isActive: dto.isActive ?? true,
                logoUrl: logoUrl
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

        const updateData: any = {...dto};

        if(dto.name){
            updateData.slug = slugify(dto.name, {
                lower: true,
                strict: true,
                replacement: '-'
            })
        }

        if(file){
            const uploadRes = await this.cloudinaryService.uploadFile(file);
            updateData.logoUrl = uploadRes.secure_url;
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
            throw new BadRequestException('Cannot delete brand that is in use by products');
        }

        await this.prisma.brand.delete({
            where: {id}
        });

        return {
            message: 'Brand deleted successfully'!
        }
    }
}
