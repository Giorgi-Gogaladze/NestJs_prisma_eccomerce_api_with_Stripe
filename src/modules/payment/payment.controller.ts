import { BadRequestException, Controller, Headers, HttpCode, HttpStatus, Inject, Post, Req } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { STRIPE_CLIENT } from './stripe/stripe.module';
import Stripe from 'stripe';;
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    @Inject(STRIPE_CLIENT) private readonly stripe: InstanceType<typeof Stripe>,
    private readonly configService: ConfigService
  ) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK) // stripe-ს ყოველთვის უნდა დავუბრუნოთ 200 ok
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: Request
  ): Promise<{ received: boolean }> {

    if(!signature) throw new BadRequestException('Missing stripe-signature header')

    let event: any; 

    try {
      const rawBody = (request as any).rawBody || JSON.stringify(request.body);
      const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET')!;

      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
    } catch (error: any) {
      throw new BadRequestException(`Webhook Error: ${error.message}`);
    }

    // ვამოწმებთ, რა ტიპის შეტყობინება მოვიდა Stripe-ისგან
    const paymentIntent = event.data.object as any;

    switch(event.type){
      case 'payment_intent.succeeded':
        await this.paymentService.handleSuccessfulPayment(paymentIntent.id);
        break;

      case 'payment_intent.payment_failed': 
        await this.paymentService.handleFailedPayment(paymentIntent.id);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return {received: true}

  };
}
