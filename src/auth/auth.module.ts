import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthStrategy } from '../strategies/auth.strategy';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      useFactory: () => ({
        secret: process.env.JWT_SECRET || 'default_secret',
        signOptions: {expiresIn: '1h'},
      })
    }),
    PrismaModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthStrategy],
})
export class AuthModule {}
