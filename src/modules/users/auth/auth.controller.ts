import { Controller, Post, Body, Patch, Get, UseGuards} from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../custom_decorators/user.decorator';
import { Public } from '../custom_decorators/public.decorator';
import { AtGuard } from '../guards/at.guard';


@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService
  ) {}

  @Public()
  @Post('signup')
  async signup(@Body() signupDto: SignupDto){
    return this.authService.signup(signupDto);
  }

  @Public()
  @Post('signin')
  async signin(@Body() signinDto: SigninDto){
    return this.authService.signin(signinDto);
  }


  @UseGuards(AtGuard)
  @Patch('update_user')
  async undateUser(
    @Body() updateUserDto: UpdateUserDto,
    @User('sub') userId: string
  ){
    return this.authService.updateUser(userId, updateUserDto);
  }


  @UseGuards(AtGuard)
  @Get('profile')
  async getProfileData(@User() user: any){
    return await this.authService.getProfileData(user);
  }


  
}
