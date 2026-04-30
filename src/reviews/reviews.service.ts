import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
    constructor(private readonly prisma: PrismaService){}

    async updateAvgRating(productId: string){
        const reviews = await this.prisma.reviews.findMany({
            where: {productId},
            select: {rating: true}
        });

        const reviewCount = reviews.length;

        const averageRating = reviewCount > 0 
        ? reviews.reduce((sum, rev) => sum + Number(rev.rating), 0) / reviewCount
        : 0;

        await this.prisma.product.update({
            where: {id: productId},
            data: {
                avgRating: parseFloat(averageRating.toFixed(1)),
                reviewCount: reviewCount
            }
        })

    }
}
