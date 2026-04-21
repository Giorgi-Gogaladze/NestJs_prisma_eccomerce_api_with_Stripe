import { Body, ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dtos/create_category.dto';
import slugify from 'slugify'
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class CategoriesService {
    constructor (
        private readonly prisma: PrismaService,
        private readonly cloudinaryService: CloudinaryService
    ){}

    async createCategory(dto: CreateCategoryDto, file: Express.Multer.File){
        const existingCategory = await this.prisma.category.findFirst({
            where: {
                    name: dto.name,
                    parentId: dto.parentId || null
                },
        });

        if(existingCategory){
            throw new ConflictException(`Category with name ${dto.name} already exist`);
        };

        const categorySlug = slugify(dto.name, {
            lower: true,
            strict: true,
            replacement: '_'
        });

        let thumbnailUrl = null;
        if(file){
            const uplaodRes = await this.cloudinaryService.UploadFile(file);
            thumbnailUrl = uplaodRes.secure_url;
        }

        return await this.prisma.category.create({
            data: {
                name: dto.name,
                description: dto.description,
                parentId: dto.parentId || null,
                slug: categorySlug,
                thumbnailUrl: thumbnailUrl,
                isActive: dto.isActiove ?? true
            }
        })

    }

}
