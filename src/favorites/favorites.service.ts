import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Favorites } from '@prisma/client';

@Injectable()
export class FavoritesService {
    constructor(private readonly prisma: PrismaService){}

    async addToFavorites(userId: string, variantId: string): Promise<Favorites>{
        const variant = await this.prisma.productVariant.findUnique({
            where: {id: variantId}
        });
        if(!variant) throw new NotFoundException('Product variant not found');

        return this.prisma.favorites.create({
            data: {
                userId,
                variantId,
            },
            include: {
                variant: {
                    include: {
                        product: true
                    }
                }
            }
        })
    }


    async removeFromFavorites(userId: string, variantId: string): Promise<{message: string}>{
        const favorite = await this.prisma.favorites.findFirst({
            where: {
                userId, 
                variantId
            }
        });
        if(!favorite) throw new NotFoundException('Favorite product not found');
        await this.prisma.favorites.delete({
            where: { id: favorite.id }
        });
        return { message: 'Product removed from favorites' };
    }


    async getMyFavorites(userId: string): Promise<Favorites[]>{
        return this.prisma.favorites.findMany({
            where: { userId },
            include: {
                variant: {
                    include: {
                        product: true
                    }
                }
            }
        })
    }


}
