import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dtos/create_review.dto';
import { Reviews } from '@prisma/client';
import { UpdateReviewDto } from './dtos/update_review.dto';

@Injectable()
export class ReviewsService {
    constructor(private readonly prisma: PrismaService){}

    async createReview(userId: string, dto: CreateReviewDto): Promise<Reviews>{
        const existingReview = await this.prisma.reviews.findFirst({
            where: {
                userId, 
                productId: dto.productId
            }
        });
        if(existingReview) throw new Error('You have already reviewed this product');

        const review = await this.prisma.reviews.create({
            data: {
                userId,
                productId: dto.productId,
                rating: dto.rating,
                comment: dto.comment
            }
        });
        return review;
    }


    async updateReview(reviewId: string, dto: UpdateReviewDto, userId: string): Promise<Reviews>{
        const review = await this.prisma.reviews.findFirst({where:  
            {
            id: reviewId,
            userId
            }
        });
        if(!review) throw new Error('Review not found');

        return await this.prisma.reviews.update({
            where: {
                id: reviewId, 
                userId
            },
            data:  {...dto}
        })
    }


    async deleteReview(reviewId: string, userId: string, isAdmin: boolean): Promise<{message: string}>{
        const review = await this.prisma.reviews.findFirst({ 
            where: {
                id: reviewId, 
                ...(isAdmin ? {} : {userId})
            }
        });

        if(!review) throw new NotFoundException(`Review with id ${reviewId} not found`);

        await this.prisma.reviews.delete({ where: {id: reviewId}});
        return {message: 'Review deleted successfully'};
    }



    async getProductReviews(productId: string): Promise<Reviews[]>{
        return await this.prisma.reviews.findMany({
            where: {productId},
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true
                    }
                },
                product: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        })
    }



    async getuserReviews(userId: string): Promise<Reviews[]>{
        return await this.prisma.reviews.findMany({
            where: {userId},
            include: { 
                user: {
                    select: {
                        id: true,   
                        email: true,
                        firstName: true,
                        lastName: true
                    }
                },  
                product: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        })
    }



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
