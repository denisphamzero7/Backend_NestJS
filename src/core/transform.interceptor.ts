import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
  } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
  import { Observable } from 'rxjs';
  import { map } from 'rxjs/operators';
  
  export interface Response<T> {
    statusCode: number;
    data: T;
    message:string
  }
  
  @Injectable()
  export class TransformInterceptor<T>
    implements NestInterceptor<T, Response<T>> {
        constructor(private reflector: Reflector){

          }
    intercept(
      context: ExecutionContext,
      next: CallHandler,
    ): Observable<Response<T>> {
        const message = this.reflector.get<string>('ResponseMessage', context.getHandler()) || ''
      return next
        .handle()
        .pipe(
          map((data) => ({
            statusCode: context.switchToHttp().getResponse().statusCode,
            message:message,
            data:data
          })),
        );
    }
  }
// thống dữ liệu trả ra của backend