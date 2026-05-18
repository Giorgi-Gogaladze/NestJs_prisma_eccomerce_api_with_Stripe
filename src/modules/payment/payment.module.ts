import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { StripeModule } from './stripe/stripe.module';

@Module({
  imports: [PrismaModule, StripeModule],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
