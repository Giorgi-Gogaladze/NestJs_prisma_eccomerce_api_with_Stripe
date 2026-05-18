import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { STRIPE_CLIENT } from './stripe/stripe.module';
import  Stripe from 'stripe';
import { Currency, PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class PaymentService {
    constructor(
        @Inject(STRIPE_CLIENT) private readonly stripe: InstanceType<typeof Stripe>,
        private readonly prisma: PrismaService
    ){}

    async createCheckout(orderId: string){
        const order = await this.prisma.order.findUnique({
            where: {id: orderId}
        });

        if (!order) {
            throw new NotFoundException(`Order with ID ${orderId} not found`);
        }

        try {
            const amountIntTetris = Math.round(Number(order.totalAmount) * 100);
            const intent = await this.stripe.paymentIntents.create({
                amount: amountIntTetris,
                currency: order.currency.toLowerCase(),  //(ჩემთვის)Stripe ითხოვს პატარა ასოებით (მაგ: 'gel')
                metadata: {orderId: order.id}, //ეს მჭირდება Webhook-ისთვის (კავშირისთვის)
                payment_method_types: ['card'],
            });

            await this.prisma.payment.create({
                data: {
                    stripePaymentIntentId: intent.id,
                    amount: order.totalAmount, //Prisma მოდელში amount არის decimal
                    currency: order.currency as Currency,
                    status: PaymentStatus.PENDING,
                    orderId:order.id
                },
            });


            return {
                clientSecret: intent.client_secret, //კლიენტის სეკრეტის დაბრუნება ფრონტენდისთვის
                stripePaymentIntentId: intent.id,
            }

        } catch (error: any) {
            throw new InternalServerErrorException(`Payment checkout failed: ${error.message}`);
        }
    }
    
}
