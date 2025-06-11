
import { Controller,Post,UseGuards,Request, Get, Body, Req, Res } from '@nestjs/common';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from './auth.service';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { PassThrough } from 'stream';
import { Response } from 'express';




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
  getProfile(@Request() req) {
    return req.user;
  }
}
