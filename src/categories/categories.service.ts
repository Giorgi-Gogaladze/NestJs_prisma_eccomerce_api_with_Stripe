import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dtos/create_category.dto';
import slugify from 'slugify'
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Category } from '@prisma/client';
import { UpdateCategoryDto } from './dtos/update_category.dto';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

export interface categoryWithChildren extends Category {
    children: categoryWithChildren[];
    _count?: {
        product: number;
    };
}

@Injectable()
export class CategoriesService {
    constructor (
        private readonly prisma: PrismaService,
        private readonly cloudinaryService: CloudinaryService, 
        @Inject(CACHE_MANAGER) private cacheManager: Cache  // ჩავაინჯექთე ქეშმენეჯერი რომ ქესირება გამოვიყენო
    ){}

    
    //მხოლოდ იმ ფუნქციებთან, რომლებიც მონაცემებს ცვლიან
    private async clearCache(){   
        await this.cacheManager.del('categories_full_tree');  
    }



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
            const uplaodRes = await this.cloudinaryService.uploadFile(file);
            thumbnailUrl = uplaodRes.secure_url;
        }

        const newCat =  await this.prisma.category.create({
            data: {
                name: dto.name,
                description: dto.description,
                parentId: dto.parentId || null,
                slug: categorySlug,
                thumbnailUrl: thumbnailUrl,
                isActive: dto.isActive ?? true
            }
        });

        await this.clearCache();//(ჩემთვის) ჯერ უნდა შევინახო ცვლადში ბაზიდან დაბრუნებული მნიშვნელობა, მერე წავშალო ქეში
        return newCat;  

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
            const uploadRes = await this.cloudinaryService.uploadFile(file);
            updateData.thumbnailUrl = uploadRes.secure_url;
        }

        const updatedCat = await this.prisma.category.update({
            where: {id},
            data: updateData
        })
        await this.clearCache();
        return updatedCat;
    }


    async deleteCategory(id: string): Promise<{message: string}>{
        const category = await this.prisma.category.findUnique({
            where: {id},
            include: {_count: {select: {product: true, children: true}}}
        });

        if(!category){
            throw new NotFoundException('Category not found');
        }

        if(category._count.product > 0){
            throw new BadRequestException('Cannot delete category with existing products');
        }

        if(category._count.children > 0){
            throw new BadRequestException('Cannot delete category with sub-categories');
        }

        //ახლა არ მინდა გამოყენება(just for refference for future projs)
        //(ჩემთვის) url-იდან Publicid-ს ამოღება და წაშლა მაგ: "https://.../folder/image_name.jpg" -> "folder/image_name")
        /* if(category.thumbnailUrl){
            const parts = category.thumbnailUrl.split('/');
            const lastPart = parts[parts.length - 1] //image_name.jpg
            const publicId = lastPart.split('.')[0];

            const folder = 'categories/'
            await this.cloudinaryService.deleteFile(`${folder}${publicId}`)
        } */

       await this.prisma.category.delete({where: {id}});
       await this.clearCache();
        return {
            message: 'Category removed successfully'
        } 
        
    }


    async getAllCategories(): Promise<categoryWithChildren[]>{ 
        //(ჩემთვის) აქ ვაბრტყელებთ კატეგორიებს, რომ შემდედგ შევქმნათ ხე
        const allCategories = await this.prisma.category.findMany({
            include: {
                _count: { select: {product: true}}
            },
        });

        //მერე მეპს ვქმნით ჩილდრენები, რომ თუ ვინმეს შვილი ჰყავს, იქ ჩაბაგდოთ და ხისებრი სტრუქტურა შევქმნათ
        const categoryMap = new Map<string, categoryWithChildren>();

        allCategories.forEach((cat) => {
            categoryMap.set(cat.id, {...cat, children: []});
        })

        const tree: categoryWithChildren[] = [];
        for(const cat of categoryMap.values()){
            if(cat.parentId === null){
                tree.push(cat)
            }else {
                const parent  = categoryMap.get(cat.parentId);
                if(parent){
                    parent.children.push(cat)
                }
            }
        };

        return tree;
    }


    async getCategoryBySlug(slug: string){
        const category = await this.prisma.category.findUnique({
            where: {slug: slug},
            include: {
                children: {
                    include: {
                        _count: {
                            select: {
                                product: true
                            }
                        }
                    }
                },
                product: true
            }
        });
        if(!category)  throw new NotFoundException("Category not found");

        const hasChildren = category.children.length > 0;

        return {
            id: category.id,
            name: category.name,
            description: category.description,
            thumbnailUrl: category.thumbnailUrl,
            subCategories: hasChildren ? category.children : [],
            products: hasChildren  ? [] : category.product,
            isLeaf: !hasChildren  //ფლაგი ფრონტნდისთვის
        }
    }

}
