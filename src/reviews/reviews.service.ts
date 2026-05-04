import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dtos/create_review.dto';
import { Reviews } from '@prisma/client';
import { UpdateReviewDto } from './dtos/update_review.dto';
import { ReviewsQueryDto } from './dtos/reviews_query.dto';

@Injectable()
export class ReviewsService {
    constructor(private readonly prisma: PrismaService){}

    async createReview(userId: string, dto: CreateReviewDto, isAdmin: boolean, productId: string): Promise< Reviews | { message: string }>{
        if(isAdmin){
            return {
                message: 'Admin cant create review'
            }
        };

        const existingReview = await this.prisma.reviews.findFirst({
            where: {
                userId, 
                productId,
            }
        });
        if(existingReview) throw new ConflictException('You have already reviewed this product.')

        const review = await this.prisma.reviews.create({
            data: {
                userId,
                productId,
                rating: dto.rating,
                comment: dto.comment
            }
        });
        await this.updateAvgRating(productId);
        return review;
    }


    async updateReview(reviewId: string, dto: UpdateReviewDto, userId: string, productId: string): Promise<Reviews>{
        const review = await this.prisma.reviews.findFirst({where:  
            {
            id: reviewId,
            userId,
            }
        });
        if(!review) throw new Error('Review not found');

        const updateReview = await this.prisma.reviews.update({
            where: { id: reviewId },
            data:  {...dto}
        });
        if( dto.rating !== undefined){
            await this.updateAvgRating(review.productId);
        }
        return updateReview;
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



    async getProductReviews(productId: string, query: ReviewsQueryDto){
        const { limit = 10, page = 1, sortBy } = query;
        const skip = (page - 1) * limit;

        const [reviews, total] = await Promise.all([
            this.prisma.reviews.findMany({
                where: {productId},
                skip,
                take: limit,
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
                    },
                },
                orderBy: {
                    createdAt: sortBy === 'newest' ? 'desc' : 'asc'
                },
            }),
            this.prisma.reviews.count({ where: { productId }})
        ]);

        return {
            data: reviews,
            meta: {
                totalCount: total,
                page,
                limit,
                hasnextPage: skip + reviews.length < total
            }
        }
    }


    

    async getMyReviews(userId: string): Promise<Reviews[]>{
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
        const reviews = await this.prisma.reviews.aggregate({
            where: {productId},
            _avg: {rating: true},
            _count: {rating: true}
        });

        const avgRating = reviews._avg.rating || 0;
        const reviewCount = reviews._count.rating || 0;

        await this.prisma.product.update({
            where: {id: productId},
            data: {
                avgRating: parseFloat(avgRating.toFixed(1)),
                reviewCount: reviewCount
            }
        })

    }
}
