
import {
  BadRequestException,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY,IS_PUBLIC_PERMISSION } from 'src/decorator/customize';
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
    const isSkipPermisson = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_PERMISSION, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (err || !user) {
      throw err || new UnauthorizedException("token not valid!!!");
    }

    // check permisions

    const targetMethod = request.method;
    console.log("Method:",targetMethod);
    const targetEndpoint = request.route?.path as string;
    console.log("endpoint: ",targetEndpoint);
  
    const permissions = user?.permissions ?? [];
    console.log("✅ USER PERMISSIONS:",permissions);
    let isExist = permissions.find(permission =>
      targetMethod === permission.method
  &&
  targetEndpoint.includes(permission.apiPath)
    )

    if(targetEndpoint.startsWith("/api/v1/auth")) isExist = true;
    if(!isExist&&!isSkipPermisson){
      throw new BadRequestException("not allow access endpoint!!!!!");
    }
    return user;
  }
}