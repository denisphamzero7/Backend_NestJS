import {
  SetMetadata,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import 'reflect-metadata';
export const IS_PUBLIC_KEY = 'isPublic';
export const RESPONSE_MESSAGE = 'ResponseMessage';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
export const EXCEL_COLUMN_KEY = 'excel:column';

export function ExcelColumn(columnName: string) {
  return Reflect.metadata(EXCEL_COLUMN_KEY, columnName);
}
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
export const ResponseMessage = (message: string) =>
  SetMetadata(RESPONSE_MESSAGE, message);

export const IS_PUBLIC_PERMISSION = 'isPublicPermission';
export const SkipCheckPermission = () =>
  SetMetadata(IS_PUBLIC_PERMISSION, true);
