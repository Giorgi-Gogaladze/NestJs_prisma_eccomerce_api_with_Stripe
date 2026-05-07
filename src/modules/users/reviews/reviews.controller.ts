import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsQueryDto } from './dtos/reviews_query.dto';
import { Reviews } from '@prisma/client';
import { User } from '../custom_decorators/user.decorator';
import { CreateReviewDto } from './dtos/create_review.dto';
import { UpdateReviewDto } from './dtos/update_review.dto';
import { AtGuard } from '../guards/at.guard';
import { Public } from '../custom_decorators/public.decorator';


@UseGuards(AtGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Public()
  @Get('/:productId')
  async getProductReviews(
    @Param('productId') productId: string,
    @Query() query: ReviewsQueryDto
  ){
    return await this.reviewsService.getProductReviews(productId, query);
  }

  @Get()
  async getMyReviews(
    @User() user: any 
  ): Promise<Reviews[]>{
    return await this.reviewsService.getMyReviews(user?.sub,)
  }

  @Post('/products/:productId/reviews')
  async createReview(
    @Param('productId') productId: string,
    @User() user: any,
    @Body() dto: CreateReviewDto
  ): Promise<Reviews | {message: string}>{
    const isAdmin = Boolean(user?.role.includes('ADMIN'))
    return await this.reviewsService.createReview(user?.sub, dto, isAdmin, productId)
  }


  @Patch(':productId/reviews/:reviewId')
  async updateReview(
    @Param('productId') productId: string,
    @Param('reviewId') reviewId: string,
    @Body() dto: UpdateReviewDto,
    @User() user: any
  ): Promise<Reviews>{
    return await this.reviewsService.updateReview(reviewId, dto, user?.sub, productId )
  }

  @Delete('/:reviewId')
  async deleteReview(
    @Param('reviewId') reviewId: string,
    @User() user: any
  ): Promise<{message: string}>{
     const isAdmin = Boolean(user?.role?.includes('ADMIN'));
    return await this.reviewsService.deleteReview(reviewId, user?.sub, isAdmin)
  }


}
