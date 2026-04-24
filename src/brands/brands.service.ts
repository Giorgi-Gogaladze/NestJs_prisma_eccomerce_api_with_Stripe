import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Brand } from '@prisma/client';
import { CreateBrandDto } from './dtos/create_brand.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import slugify from 'slugify'

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
}
