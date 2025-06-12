
import { Controller,Post,UseGuards, Get, Body, Req, Res } from '@nestjs/common';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from './auth.service';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { PassThrough } from 'stream';
import { Request, Response,  } from 'express'; 
import { IUser } from 'src/users/user.interface';




@Controller("auth")
export class AuthController {
  constructor(


    private authService: AuthService,
 
  ) {}
  @Public()
  @UseGuards(LocalAuthGuard)
  @ResponseMessage("login a new user")
  @Post('/login')
  handelogin(
    @Req() req,
    @Res({passthrough:true}) response :Response){
    return this.authService.login(req.user,response);
  }
  @Public()
  @ResponseMessage("Register a new user")
  @Post('/register')
  handleRegister(@Body() registerUserDto: RegisterUserDto){
    return this.authService.register(registerUserDto)
  }
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@User() user:IUser) {
    return user;
  }
  @ResponseMessage("refreshtoken success")
  @Get('refresh')
  @Public()
  handlerefreshtoken(@Req() request:Request,@Res({passthrough:true}) response :Response){
    const refresh_token = request.cookies["refresh_token"];
    response.clearCookie('refresh_token');
    return this.authService.procesnewToken(refresh_token,response)
  }
}
