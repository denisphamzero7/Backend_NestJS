import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';  
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateuser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUserName(username);
    if (user) {
      const isValid = await this.usersService.Isvalidpassword(pass, user.password);
      if (isValid) {
        return user;
      }
    }
    return null;
  }

  async login(user: any) {
    const payload = { 
        username: user.email,
         sub: user._id
     }; 
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
