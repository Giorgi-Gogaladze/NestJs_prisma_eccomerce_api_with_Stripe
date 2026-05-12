import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { createOrderDto } from './dtos/create_order.dto';
import { CartService } from '../cart/cart.service';
import { Prisma } from '@prisma/client';

export type OrderWithItems = Prisma.OrderGetPayload<{
    include: {
        order_items: {
            include: { variant: true}
        }
    }
}>

@Injectable()
export class OrdersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cartService: CartService
    ){}

    private generateOrderNumber(userId: string, address: string){
    return (userId.concat(address.replace(' ', '_')).toLowerCase()).concat(String(Math.random() + 10000));
    }


    async createOrder(userId: string, dto: createOrderDto): Promise<OrderWithItems>{
         const myCart = await this.cartService.getMyCart(userId);
        if(myCart.cart_items.length === 0){
            throw new BadRequestException('Your cart is empty')
        };

        const address = await this.prisma.address.findFirst({
            where: {id: dto.addressId, userId}
        });
        if(!address) throw new BadRequestException('Address not found');

        const appliedCouon = dto.couponCode ? await this.prisma.coupon.findUnique({
            where: {code: dto.couponCode}
        }) : null;


        return await this.prisma.$transaction(async (tsx) => {
            let totalAmount = 0;
            for(const item of myCart.cart_items){
                if(item.variant.stock < item.quantity){
                    throw new ConflictException(`On porduct ${item.variant.sku} the stock is not enough`)
                };

                totalAmount += Number(item.variant.price) * item.quantity;
                if(appliedCouon !== null){
                   totalAmount -= (Number(appliedCouon.discountPerc) * totalAmount) / 100;
                }
            }
            const orderNumber = this.generateOrderNumber(userId, address.street);

            const order = await tsx.order.create({
                data: {
                    orderNumber, 
                    totalAmount, 
                    addressId: address.id,
                    userId,
                    couponId: appliedCouon?.id
                },
                include: {
                    order_items: {
                        include: {
                            variant: true
                        }
                    }
                }
            });

           for(const item of myCart.cart_items){
            await tsx.orderItem.create({
                data: {
                    orderId: order.id, 
                    variantId: item.variantId,
                    quantity: item.quantity,
                    price: item.variant.price
                }
            });

            await tsx.productVariant.update({
             where: {id: item.variantId},
             data : {stock: {decrement: item.quantity}}
            })

           };

           return order;
        });

    }


    async getMyOrders(userId: string){
        const orders = await this.prisma.order.findMany({
            where: {userId},
            orderBy: {createdAt: 'desc'},
            include: {
                _count: {
                    select: { order_items: true}
                }
            }
        });
        if(orders.length === 0){
           throw new NotFoundException('You have no orders yet') 
        }
    }


    async getOrderById(orderId: string, userId: string){
        const order = await this.prisma.order.findFirst({
            where: {
                id: orderId,
                userId
            },
            include: {
                order_items:{
                    include: { variant: true}
                },
                address: true,
                coupon: true
            }
        });
        if(!order) throw new NotFoundException('Order not found or access denied');
        return order;
    }
}
