import { Controller, Post, Body, Patch} from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../custom_decorators/user.decorator';
import { Public } from '../custom_decorators/public.decorator';


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

  @Patch('update_user')
  async undateUser(
    @Body() updateUserDto: UpdateUserDto,
    @User() user: any
  ){
    return this.authService.updateUser(user, updateUserDto);
  }


  
}
