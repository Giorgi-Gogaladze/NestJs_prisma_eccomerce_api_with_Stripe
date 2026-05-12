import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { createOrderDto } from './dtos/create_order.dto';
import { CartService } from '../cart/cart.service';

@Injectable()
export class OrdersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cartService: CartService
    ){}

    private generateOrderNumber(userId: string, address: string){
    return (userId.concat(address.replace(' ', '_')).toLowerCase()).concat(String(Math.random() + 10000));
    }


    async createOrder(userId: string, dto: createOrderDto){
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
                if(appliedCouon){
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

            const updatedVariant = await tsx.productVariant.update({
             where: {id: item.variantId},
             data : {stock: {decrement: item.quantity}}
            })

           };

           return order;
        });

    }
}
