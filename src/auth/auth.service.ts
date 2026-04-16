import { ConflictException, ForbiddenException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt'
import { SignupDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { SigninDto } from './dto/signin.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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




  async signin(signinDto: SigninDto): Promise<{accessToken: string}>{
    const {email, password} = signinDto;

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      }
    });

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





  async updateUser(user: User, updateUserDto: UpdateUserDto): Promise<{user: Omit<User, 'password' | 'refreshToken'>}> {
    const { email, firstName, lastName, newPassword, oldPassword} = updateUserDto;

    const updateData: any = {};

    if(email && email !== user.email){
      const exiistingEmail = await this.prisma.user.findUnique({
        where: { email }
      });

      if(exiistingEmail){
        throw new ConflictException('Email already exists');
      }

      updateData.email = email;
    }

    if(firstName) updateData.firstName = firstName;
    if(lastName) updateData.lastName = lastName;

    if(newPassword){

      if(!oldPassword){
        throw new ForbiddenException('Old password is required to set a new password');
      };

      const passMatches = await bcrypt.compare(oldPassword, user.password);
      if(!passMatches){
        throw new ForbiddenException('Old password is incorrect');
      };

      const salt = await bcrypt.genSalt();
      updateData.password = await bcrypt.hash(newPassword, salt);
    }
    const updatedUser = await this.prisma.user.update({
      where: { id: user.id},
      data: updateData
    }) 

    const  {password: _, refreshToken, ...rest} = updatedUser;
    return {user: rest};
  
  }


  async getTokens(userId: string, email: string, role: string){
    const payload = {sub: userId, email, role};

    const [accToken, refToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: '1h',
        secret: process.env.JWT_SECRET
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: '7d',
        secret: process.env.JWT_REFRESH_SECRET
      }),
    ]);
    return {accessToken: accToken, refreshToken: refToken};
  }


  async updateRefToken(userId: string, refToken: string){
    const hash = await bcrypt.hash(refToken, 8);
    await this.prisma.user.update({
      where: {id: userId},
      data: {refreshToken: hash}
    })
  }



  async refreshTokens(userId: string, refToken: string){
  const user = await this.prisma.user.findUnique({
    where: {id: userId}
  });

  if(!user || !user.refreshToken) throw new ForbiddenException('Access denied');

  const refTokenMatches = await bcrypt.compare(refToken, user!.refreshToken!);
  if(!refTokenMatches) throw new ForbiddenException('Access denied');

  const tokens = await this.getTokens(user.id, user.email, user.role);
  await this.updateRefToken(user.id, tokens.refreshToken);

  return tokens;
  }

}
