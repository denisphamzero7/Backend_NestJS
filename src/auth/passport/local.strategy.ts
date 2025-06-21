
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';


@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateuser(username,password);
    console.log('User found in validate:', user); // << Rất quan trọng!
    if (!user) {
      console.log('Authentication failed for user:', username); // << Thêm log này
      throw new UnauthorizedException("username or password not valid");
    }
   
    return user;
  }
}
  