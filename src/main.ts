import "dotenv/config";
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,  //ეს გვჭირდება სტრაიპისთვის, რომ ვებჰუკი მიიღოს იმ ფორმატში რაც მას სჭირდება(rაwbody);
    bodyParser: true //ეს ეუბნება, რომ სხვა req.body მაინც json ფომრატში იყოს ხელმისაწვდომი 
  });

  app.enableCors() //ეს არის cors(cross-origin-resource-sharing)_ის ნების დართვა, რომ შვძლოთ სხვა დომეინებიდან ატვირთვა
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {enableImplicitConversion: true} //როცა მონაცემებს form-data-ს სახითვაგზავნით, ყველაფერი სტრინგად მოდის, მათ შორის ბულიანიც  და ეს ეხმარება რომ სწორ ტიპად გარდაქმანს ისევ
    })
  )

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
