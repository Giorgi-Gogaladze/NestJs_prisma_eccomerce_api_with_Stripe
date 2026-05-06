import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { User } from '../custom_decorators/user.decorator';
import { Favorites } from '@prisma/client';
import { AtGuard } from '../guards/at.guard';

@Controller('favorites')
@UseGuards(AtGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post('/:variantId')
  async addToFavorites(
    @User() user: any,
    @Param('variantId') variantId: string
  ): Promise<Favorites>{
    return await this.favoritesService.addToFavorites(user.sub, variantId);
  }

  @Get()
  async getMyFavorites(
    @User() user: any
  ): Promise<Favorites[]>{
    return await this.favoritesService.getMyFavorites(user.sub);
  }


  @Delete('/:variantId')
  async removeFromFavorites(
    @Param('variantId') variantId: string,
    @User() user: any
  ): Promise<{message: string}>{
    return await this.favoritesService.removeFromFavorites(user.sub, variantId);
  }



}
