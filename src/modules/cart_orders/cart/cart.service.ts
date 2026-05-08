import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { AddItemToCartDto } from './dtos/add_item.dto';
import { Cart } from '@prisma/client';
import { UpdateCartItemQuantityDto } from './dtos/update_action.dto';

@Injectable()
export class CartService {
    constructor(private readonly prisma: PrismaService){}


    async getMyCart(userId: string): Promise<Cart>{
        const cart = await this.prisma.cart.findFirst({
            where: { userId},
            include: {
                cart_items: {
                    include: {
                        variant: true
                    }
                }
            }
        });

        if(!cart){
            const newCart = await this.prisma.cart.create({
                data: {userId},
                include: {
                    cart_items: {
                        include: {
                            variant: true
                        }
                    }
                }
            })
            return newCart;
        }
        return cart;
    }



    async addItemToCart(userId: string, dto: AddItemToCartDto): Promise<ReturnType<typeof this.getMyCart>>{
        const { quantity, variantId} = dto;
        const myCart = await this.getMyCart(userId);


        const variant = await this.prisma.productVariant.findUnique({
                where: {id: variantId},
                select: { stock: true }
        });
        if(!variant) throw new ConflictException('Variant not found');

        const existingItem = await this.prisma.cartItem.findFirst({
            where: {
                variantId,
                cartId: myCart.id
            }
        });

        if(existingItem){
            if(variant.stock < existingItem.quantity + quantity){
                throw new ConflictException('Not enough stock available for this product variant');
            }
            existingItem.quantity += quantity;
            await this.prisma.cartItem.update({
                where: {id: existingItem.id},
                data: {quantity: existingItem.quantity}
            });
        } else {
            if(variant.stock < quantity){
                throw new ConflictException('Not enough stock available for tis product variant');
            }
            await this.prisma.cartItem.create({
                data: {
                    quantity,
                    cartId: myCart.id,
                    variantId, 
                },
            })
        }
            return this.getMyCart(userId);
        
    }



    async updateCartItemQuantity(usreId: string, itemId: string, dto: UpdateCartItemQuantityDto){
        const mycart = await this.getMyCart(usreId);
        if(!mycart) throw new ConflictException('Cart not found');

        const item = await this.prisma.cartItem.findFirst({
            where: {
                id: itemId,
                cartId: mycart.id,
                },
            include: {
                variant: {
                    select: {
                        stock: true
                    }
                }
            }
        });
        if(!item) throw new NotFoundException('Cart item not found');
        if(dto.action  === 'increment'){
            if(item.variant.stock < item.quantity + 1){
                throw new ConflictException('Not enough stock available for this product variant');
            };
            await this.prisma.cartItem.update({
                where: {id: item.id},
                data: {quantity: {increment: 1}}
            })
        } else if(dto.action === 'decrement'){
            if(item.quantity === 1){
                await this.prisma.cartItem.delete({
                    where: {id: item.id}
                })
            } else {
                await this.prisma.cartItem.update({
                    where: {id: item.id},
                    data: {quantity: {decrement: 1}}
                })
            }
        }

        return this.getMyCart(usreId);
    }




    //remove item
    //ჯოით ვალიდაცია არ დამავიწყდეს
}
