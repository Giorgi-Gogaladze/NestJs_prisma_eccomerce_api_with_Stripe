import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../custom_decorators/user.decorator';


@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService
  ) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto){
    return this.authService.signup(signupDto);
  }


  @Post('signin')
  async signin(@Body() signinDto: SigninDto){
    return this.authService.signin(signinDto);
  }

  @Patch('update_user')
  async undateUser(
    @Body() updateUserDto: UpdateUserDto,
    @User() user: any
  ){
    return this.authService.updateUser(user, updateUserDto);
  }


  
}
