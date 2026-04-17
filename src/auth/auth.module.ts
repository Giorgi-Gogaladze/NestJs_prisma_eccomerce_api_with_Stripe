import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthStrategy } from '../strategies/auth.strategy';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      useFactory: () => ({
        secret: process.env.JWT_SECRET || 'default_secret',
        signOptions: {expiresIn: '1h'},
      })
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthStrategy, PrismaService],
})
export class AuthModule {}
