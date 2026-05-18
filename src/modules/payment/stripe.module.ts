import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from 'stripe'

export const STRIPE_CLIENT = 'STRIPE_CLIENT';

@Global()
@Module({
    providers: [   //პროვაიდერი არის ადგილი, სადაც ვარეგისტრირებთ კლასი(პირობითად) რომლის შემდგომ  ჩაინჯექთბა შეგვძლია
       {
         provide: STRIPE_CLIENT, //ტოკენის სახელი(ნებისმიერი სტრინგი)
         inject: [ConfigService], //ამის დახამრებით ვკითხულობთ .evs_ს
         useFactory: (configService: ConfigService) => {
            const secretKey = configService.get<string>('STRIPE_SECRET_KEY');
            if(!secretKey){
                throw new Error('STRIPE_SECRET_KEY is missing')
            };
            return new Stripe(secretKey, {
                apiVersion: '2026-04-22.dahlia'  //სტრაიპის ეიპიაის ვერსია.
            });
         },
       },
    ],
    exports: [STRIPE_CLIENT]
})

export class StripeModule{}