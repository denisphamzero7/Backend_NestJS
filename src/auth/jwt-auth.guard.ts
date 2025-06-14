
import {
  BadRequestException,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from 'src/decorator/customize';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector){
    super()
  }
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err, user, info,context: ExecutionContext) {
    console.log('JwtAuthGuard handleRequest - error:', err, 'user:', user, 'info:', info); // << Log chi tiết hơn
    const request: Request = context.switchToHttp().getRequest();
    if (err || !user) {
      throw err || new UnauthorizedException("token not valid!!!");
    }

    // check permisions

    const targetMethod = request.method;
    const targetEndpoint = request.route?.path;
  
    const permissions = user?.role?.permissions ?? [];
  
    const isExist = permissions.find(permission =>
      targetMethod === permission.method
      &&
      targetEndpoint === permission.apiPath
    )
    if(isExist){
      throw new BadRequestException("not allow access endpoint!!!!!")
    }
    return user;
  }
}