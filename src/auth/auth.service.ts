import { ConflictException, ForbiddenException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt'
import { SignupDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { SigninDto } from './dto/signin.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ){}


  async signup(signupDto: SignupDto): Promise<{user: Omit<User, 'password' | 'refreshToken'>, accessToken: string}> {
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
      accessToken: await this.jwtService.signAsync(payload),
    }

    } catch (error:any) {
      if(error.code ==='P2002'){
        throw new ConflictException('Email already exists');
      }
      throw new InternalServerErrorException();
    }
  }


  async singin(signinDto: SigninDto): Promise<{accessToken: string}>{
    const {email, password} = signinDto;

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      }
    })
    if(!user){
      throw new ForbiddenException('Invalid credentials');
    };

    const passMatches = await bcrypt.compare(password, user.password);

    if(!passMatches){
      throw new ForbiddenException('Invalid credentials');
    };

    const payload = {
        email: user.email,
        sub: user.id,
        role: user.role
      };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '1h',
      secret: process.env.JWT_SECRET
    });

    return {accessToken};
  }


}
