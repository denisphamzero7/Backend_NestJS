import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';  
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/user.interface';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

import ms from 'ms';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateuser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUserName(username);
    console.log('user :',user);
    if (user) {
      const isValid = await this.usersService.Isvalidpassword(pass,user.password);
      if (isValid) {
        return user;
      }
    }
    return null;
  }

  async login(user: IUser,response:Response) {
    const { _id, name, email, role } = user;
    const payload = { 
        iss:"From server",
         sub: "token login",
         _id,
            name,
            email,
            role
     }; 
     const refresh_token = this.createRefreshToken(payload)
     // tạo refreshhtoken
     await this.usersService.updateUserToken(refresh_token,_id)
     // set cookies
     response.cookie('refresh_token',refresh_token,{
      httpOnly:true,
      maxAge:ms(this.configService.get<string>("REFRESH_TOKEN_EXPIRE"))
     })
    return { 
      access_token: this.jwtService.sign(payload),
      refresh_token,
     user:{ _id,
      name,
      email,
      role}
    };
  }
  async register (user: RegisterUserDto){
    let newUser = await this.usersService.register(user);
    return newUser
  }
  createRefreshToken =(payload)=>{
    const refresh_token = this.jwtService.sign(payload,{
      secret: this.configService.get<string>("REFRESH_TOKEN_SECRET"),
      expiresIn:ms(this.configService.get<string>("REFRESH_TOKEN_EXPIRE"))/1000
    })
    return refresh_token 
  }
   procesnewToken=async (refreshToken: string, response:Response)=>{
    try {
      // Xác thực token
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>("REFRESH_TOKEN_SECRET"),
      });
  
      const user = await this.usersService.findUserByToken(refreshToken);
  
      if (!user) {
        throw new UnauthorizedException('User không tồn tại hoặc token không đúng');
      }
  
      const { _id, name, email, role } = user;
      const payload = {
        iss: "From server",
        sub: "token refresh",
        _id,
        name,
        email,
        role,
      };
  
      const refresh_token = this.createRefreshToken(payload);
  
      await this.usersService.updateUserToken(refresh_token, _id.toString());
  
      // // Xoá token cũ
      // response.clearCookie('refresh_token');
  
      // Gán lại cookie mới
      response.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        maxAge: ms(this.configService.get<string>("REFRESH_TOKEN_EXPIRE")) * 1000,
      });
  
      return {
        access_token: this.jwtService.sign(payload),
        refresh_token,
        user: {
          _id,
          name,
          email,
          role,
        },
      };
    } catch (error) {
      console.error('Refresh token error:', error.message);
      throw new UnauthorizedException('Refresh token error');
    }
  }
  async logout (response:Response,user:IUser){
    await this.usersService.updateUserToken("",user._id.toString())
    response.clearCookie('refresh_token');
    return true
  }
  async changePassword(id: string, oldPassword: string, newPassword: string) {
    // Tìm user đầy đủ (bao gồm mật khẩu)
    const userInDb = await this.usersService.findByIdWithPassword(id);
  
    if (!userInDb) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }
  
    const isMatch = await this.usersService.Isvalidpassword(oldPassword, userInDb.password);
    if (!isMatch) {
      throw new UnauthorizedException('Mật khẩu cũ không chính xác');
    }
  
    const updatedUser = await this.usersService.updatePassword(id, newPassword);
  
    return {
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email
      }
    };
  }
  
}
