import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends OmitType(
    PartialType(CreateUserDto), 
    ['password'] as const
  ) {
    _id: string;
  }