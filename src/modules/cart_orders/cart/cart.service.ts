import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { AddItemToCartDto } from './dtos/add_item.dto';

@Injectable()
export class CartService {
    constructor(private readonly prisma: PrismaService){}


    async getMyCart(userId: string){
        const cart = await this.prisma.cart.findFirst({
            where: { userId}
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



    async addItemToCart(userId: string, dto: AddItemToCartDto){
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
}
