import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt'
import { SignupDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ){}

  async signup(signupDto: SignupDto): Promise<{user: Omit<User, 'password' | 'refreshToken'>, access_token: string}> {
    const {email, password, firstName, lastName} = signupDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
      const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName, 
        lastName
      },
    });

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role
    };

    const { password: _, refreshToken, ...userWithoutSensitive } = user;

    return {
      user: userWithoutSensitive,
      access_token: await this.jwtService.signAsync(payload),
    }

    } catch (error:any) {
      if(error.code ==='P2002'){
        throw new ConflictException('Email already exists');
      }
      throw new InternalServerErrorException();
    }
  }
}
