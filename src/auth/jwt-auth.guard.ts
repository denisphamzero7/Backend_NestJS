import {
  BadRequestException,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY, IS_PUBLIC_PERMISSION } from 'src/decorator/customize';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);
  constructor(private reflector: Reflector) {
    super();
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

  handleRequest(err, user, _info, context: ExecutionContext) {
      const request = context.switchToHttp().getRequest<Request>();
    // const request: Request = context.switchToHttp().getRequest();

    if(process.env.NODE_ENV !== 'production'){
      this.logger.debug(`Auth attempt: ${request.method} ${request.url}`);
      this.logger.debug(`User: ${user?.email||'none'}`);
      this.logger.debug(`Error:${err?.message||'none'}`);
    }
    if (err){
      this.logger.warn(`Auhthentication error: ${err.message}`);
    }
    if(!user){
      throw new UnauthorizedException(
        `Invalid or exprired token`
      )
    }
    if (user.role?.name==='admin'){
      this.logger.debug('Admin access granted');
      return user;
    }
    const isSkipPermisson = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_PERMISSION,
      [context.getHandler(), context.getClass()],
    );
    if(isSkipPermisson){
      return user;
    }
    
  


    


    // const targetMethod = request.method;
    // console.log('Method:', targetMethod);
    // const targetEndpoint = request.route?.path as string;
    // console.log('endpoint: ', targetEndpoint);

    // const permissions = user?.permissions ?? [];
    // console.log('✅ USER PERMISSIONS:', permissions);
    // let isExist = permissions.find(
    //   (permission: { method: string; apiPath: string; }) =>
    //     targetMethod === permission.method &&
    //     targetEndpoint.includes(permission.apiPath),
    // );

    // if (targetEndpoint.startsWith('/api/v1/auth')) isExist = true;
    // if (!isExist && !isSkipPermisson) {
    //   throw new BadRequestException('not allow access endpoint!!!!!');
    // }
    // return user;
     this.validatePermission(request, user);

    return user;
  }
  private validatePermission(request:Request,user:any):void{
    const targetMethod = request.method;
    const targetEndpoint = request.route?.path as string;
    if(!targetEndpoint){
      throw new BadRequestException('Cannot determine endpoint path');
    
    }
    const permission= user?.permission ?? [];
    this.logger.debug(
      `Checking permissions: ${targetMethod} ${targetEndpoint}`
    )
  // Check if user has required permission
    const hasPermission = permission.some(
      (permission: { method: string; apiPath: string }) => {
        return (
          targetMethod === permission.method &&
          this.matchPath(targetEndpoint, permission.apiPath)
        );
      },
    );
     if (!hasPermission) {
      this.logger.warn(
        `Permission denied: User ${user.email} attempted to access ${targetMethod} ${targetEndpoint}`,
      );
      throw new BadRequestException(
        `You don't have permission to access this endpoint: ${targetMethod} ${targetEndpoint}`,
      );
    }
  }
  private matchPath(targetEndpoint: string, apiPath: string) {
    // Exact match
    if (targetEndpoint === apiPath) {
      return true;
    }

    // Convert Express route params to regex pattern
    // Example: /api/v1/users/:id -> /api/v1/users/[^/]+
    const pattern = apiPath
      .replace(/:[^/]+/g, '[^/]+') // Replace :id with regex
      .replace(/\*/g, '.*'); // Support wildcard

    const regex = new RegExp(`^${pattern}$`);
    return regex.test(targetEndpoint);
  }
}
