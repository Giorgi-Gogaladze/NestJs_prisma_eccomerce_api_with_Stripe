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


    //ეს ფუნქცია მუშავდება მაშინ, როდესაც Stripe Webhook გვიდასტურებს, რომ გადახდა წარმატებულია.
    async handleSuccessfulPayment(paymentIntentId: string){
        const payment = await this.prisma.payment.findUnique({
            where: {stripePaymentIntentId: paymentIntentId}, 
            include: {order: true}
        });

        if(!payment) return;
        if(payment.status === PaymentStatus.SUCCEEDED) return;  //ტუ უკვე საქსესია, აღარაფერი გავაკეთოთ
        
        await this.prisma.$transaction(async (tsx) => {
            await tsx.payment.update({
                where: {id: payment.id},
                data: {status: PaymentStatus.SUCCEEDED}
            });

            await tsx.order.update({
                where: {id: payment.order.id},
                data: {status: 'PAID'}
            })
        })
    }

    async handleFailedPayment(paymentIntentId: string){
        const payment = await this.prisma.payment.findUnique({
            where: {stripePaymentIntentId: paymentIntentId}, 
        });

        if (!payment) return;
        if (payment.status === PaymentStatus.FAILED) return;

        await this.prisma.$transaction(async (tx) => {
            await tx.payment.update({
                where: { id: payment.id },
                data: { status: PaymentStatus.FAILED }
            });

            await tx.order.update({
                where: { id: payment.orderId },
                data: { status: 'CANCELLED' } 
            });
        });
    }

}
