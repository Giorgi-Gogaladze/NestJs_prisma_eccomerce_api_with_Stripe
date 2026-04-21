import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dtos/create_category.dto';
import slugify from 'slugify'
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Category } from '@prisma/client';
import { UpdateCategoryDto } from './dtos/update_category.dto';

@Injectable()
export class CategoriesService {
    constructor (
        private readonly prisma: PrismaService,
        private readonly cloudinaryService: CloudinaryService
    ){}


    async createCategory(dto: CreateCategoryDto, file: Express.Multer.File): Promise<Category>{
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
            replacement: '-'
        });

        let thumbnailUrl = null;
        if(file){
            //ქლაუდინარიზე ატვირთვა
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


    async updateCategory(id: string, dto: UpdateCategoryDto, file?: Express.Multer.File): Promise<Category>{
        const exists = await this.prisma.category.findUnique({
            where: { id }
        });
        if(!exists){
            throw new NotFoundException(`Category with id: ${id} not found`);
        }
        const updateData: any = { ...dto};
        
        if(dto.name){
            updateData.slug = slugify(dto.name, 
            {
                lower: true,
                strict: true,
                replacement: '-'
            });
        }

        if(file){
            const uploadRes = await this.cloudinaryService.UploadFile(file);
            updateData.thumbnailUrl = uploadRes.secure_url;
        }

        return await this.prisma.category.update({
            where: {id},
            data: updateData
        })
    }

}
