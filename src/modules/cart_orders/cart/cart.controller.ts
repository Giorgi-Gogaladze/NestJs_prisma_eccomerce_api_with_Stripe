import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { User } from '../../../shared/custom_decorators/user.decorator';
import { Cart } from '@prisma/client';
import { AddItemToCartDto } from './dtos/add_item.dto';
import { UpdateCartItemQuantityDto } from './dtos/update_action.dto';
import { AtGuard } from '../../../shared/guards/at.guard';

@UseGuards(AtGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getMyCart(
    @User() user: any
  ): Promise<Cart>{
    return await this.cartService.getMyCart(user.sub);
  }

  @Post()
  async addItemToDto(
    @User() user: any,
    @Body() dto: AddItemToCartDto
  ): Promise<ReturnType<typeof this.getMyCart>>{
    return await this.cartService.addItemToCart(user.sub, dto)
  }


 @Delete()
  async clearMyCart(
    @User() user: any,
  ): Promise<{message: string}>{
    return await this.cartService.clearMyCart(user.sub)
  }


  @Patch('/:itemId')
  async updateCartItemQuantity(
    @User() user: any,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartItemQuantityDto
  ): Promise<Cart>{
    return await this.cartService.updateCartItemQuantity(user.sub,itemId, dto )
  }


  @Delete('/:itemId')
  async removeItemFromCart(
    @User() user: any,
    @Param('itemId') itemId: string,
  ): Promise<{message: string}>{
    return await this.cartService.removeItemFromCart(user.sub, itemId)
  }

}
