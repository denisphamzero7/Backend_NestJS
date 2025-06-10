import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';  
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/user.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
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

  async login(user: IUser) {
    const { _id, name, email, role } = user;
    const payload = { 
        iss:"From server",
         sub: "token login",
         _id,
            name,
            email,
            role


     }; 
     console.log('payload :::',payload);
    return {
      access_token: this.jwtService.sign(payload),
      _id,
      name,
      email,
      role
    };
  }
}
