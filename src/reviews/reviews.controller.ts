import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsQueryDto } from './dtos/reviews_query.dto';
import { Reviews } from '@prisma/client';
import { User } from '../custom_decorators/user.decorator';
import { CreateReviewDto } from './dtos/create_review.dto';
import { UpdateReviewDto } from './dtos/update_review.dto';
import { arrayNotEmpty } from 'class-validator';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('/:id')
  async getProductReviews(
    @Param('id') id: string,
    @Query() query: ReviewsQueryDto
  ){
    return await this.reviewsService.getProductReviews(id, query);
  }


  @Get()
  async getMyReviews(
    @User() user: any 
  ): Promise<Reviews[]>{
    return await this.reviewsService.getMyReviews(user?.sub,)
  }

  @Post()
  async createReview(
    @User() user: any,
    @Body() dto: CreateReviewDto
  ): Promise<Reviews>{
    return await this.reviewsService.createReview(user?.sub, dto)
  }


  @Patch('reviewId')
  async updateReview(
    @Param('reviewId') reviewId: string,
    @Body() dto: UpdateReviewDto,
    @User() user: any
  ): Promise<Reviews>{
    return await this.reviewsService.updateReview(reviewId, dto, user?.sub )
  }

  @Delete('reviewId')
  async deleteReview(
    @Param('reviewId') reviewId: string,
    @User() user: any
  ): Promise<{message: string}>{
     const isAdmin = Boolean(user?.role?.include('ADMIN'));
    return await this.reviewsService.deleteReview(reviewId, user?.sub, isAdmin)
  }


}
