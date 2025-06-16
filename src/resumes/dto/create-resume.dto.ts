import { Transform, Type } from 'class-transformer';
import {
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import mongoose, { Types } from 'mongoose';

export class CreateResumeDto {
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsNotEmpty({ message: 'Url is required' })
  url: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim()) // loại bỏ khoảng trắng thừa
  status: string;

  @IsNotEmpty({ message: 'Company is required' })
  @IsMongoId({ message: 'Company must be a valid MongoDB ObjectId' })
  company: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({ message: 'Job is required' })
  @IsMongoId({ message: 'Job must be a valid MongoDB ObjectId' })
  job: mongoose.Schema.Types.ObjectId;
}
export class CreateUserCvDto {
  @IsNotEmpty({ message: 'Url is required' })
  url: string;

  @IsNotEmpty({ message: 'Company is required' })
  @IsMongoId({ message: 'Company must be a valid MongoDB ObjectId' })
  company: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({ message: 'Job is required' })
  @IsMongoId({ message: 'Job must be a valid MongoDB ObjectId' })
  job: mongoose.Schema.Types.ObjectId;
}
