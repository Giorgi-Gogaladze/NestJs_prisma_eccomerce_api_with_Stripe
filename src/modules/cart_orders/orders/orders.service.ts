import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { createOrderDto } from './dtos/create_order.dto';
import { CartService } from '../cart/cart.service';
import { Order, Prisma } from '@prisma/client';
import { UpdateOrderStatusDto } from './dtos/update_order_status.dto';

export type OrderWithItems = Prisma.OrderGetPayload<{
    include: {
        order_items: {
            include: { variant: true}
        }
    }
}>

export type OrderWithCount= Prisma.OrderGetPayload<{
    include: {
        _count: {
            select: {
                order_items: true
            }
        }
    }
}>

export type DetailedOrder = Prisma.OrderGetPayload<{
    include: {
        order_items: {
            include: { variant: true }
        },
        address: true,
        coupon: true
    }
}>;

@Injectable()
export class OrdersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cartService: CartService
    ){}

    private generateOrderNumber(): string{
     const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
     const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
     return `ORD-${datePart}-${randomPart}`
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
            }

            if(appliedCouon !== null){
                   totalAmount -= (Number(appliedCouon.discountPerc) * totalAmount) / 100;
            }

            const orderNumber = this.generateOrderNumber();

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
           await tsx.cartItem.deleteMany({
            where: {cartId: myCart.id}
           })

           return order;
        });

    }


    async getMyOrders(userId: string): Promise<OrderWithCount[]>{
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
        return orders;
    }


    async getOrderById(orderId: string, userId: string): Promise<DetailedOrder>{
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


    async updateStatus(orderId: string, dto: UpdateOrderStatusDto): Promise<Order>{
        const currentOrder = await this.prisma.order.findUnique({
            where: {id: orderId}
        });
        if(!currentOrder) throw new NotFoundException('Order not found');

        if(currentOrder.status === 'DELIVERED' || currentOrder.status === 'CANCELLED'){
            throw new ConflictException(`Cant change a status of ${currentOrder.status} order`)
        };

        if(dto.status === 'CANCELLED'){
            await this.cancelOrder(currentOrder.userId, orderId)
        }

        try {
            return await this.prisma.order.update({
                where: {id: orderId},
                data: {
                    status: dto.status
                }
            })
        } catch (error) {
            throw new BadRequestException('Failed ot update order status')
        }
    }


    async cancelOrder(userId: string, orderId: string){
        const order = await this.prisma.order.findFirst({
            where: {id: orderId, userId},
            include: { order_items: true }
        });
        if(!order) throw new NotFoundException('Order not found or access denied');

        const nonCancelable = ['SHIPPED' ,'DELIVERED']
        if(nonCancelable.includes(order.status)){
            throw new ConflictException('Order is already on its way, you cant cancel it.');
        }
        return await this.prisma.$transaction(async (tsx) => {
            await tsx.order.update({
                where: {id: orderId},
                data: { status: 'CANCELLED'}
            });

            for(let item of order.order_items){
                const updatedQuant = await tsx.productVariant.update({
                    where: {id: item.id},
                    data: { stock: 
                        {increment: item.quantity}
                    }
                })
            }
            return {message: 'Order canceled successfully'}

        });
    }


    async getActiveOrders(): Promise<Order[]>{
        return await this.prisma.order.findMany({
            where: {status: 
                {in: ['DELIVERED' ,'PENDING', 'PROCESSING', 'SHIPPED' ]}
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email:true
                    }
                },
                _count: {
                    select: {order_items: true}
                }
            },
            orderBy: {createdAt: 'asc'}
        })
    }


    async getCanceledOrders(){
        return await this.prisma.order.findMany({
            where: {
                status: 'CANCELLED'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email:true
                    }
                },
                _count: {
                    select: {
                        order_items: true
                    }
                }
            },
            orderBy: {createdAt: 'desc'}
        })
    }

}
