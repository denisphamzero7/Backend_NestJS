import {
    IsArray,
    IsBoolean,
    IsNotEmpty,
    IsNotEmptyObject,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
    ValidateNested
  } from 'class-validator';
  import { Transform, Type } from 'class-transformer';
  import mongoose from 'mongoose';
  

  
  export class CreateJobDto {
    @IsNotEmpty({ message: 'Job name must not be empty' })
    name: string;
  
    @IsNotEmpty({ message: 'Skills must not be empty' })
    @IsArray({ message: 'Skills must be an array' })
    @IsString({ each: true, message: 'Each skill must be a string' })
    skills: string[];
  
   @IsNotEmpty({message:'not empty'})
    company: string
  
    @IsOptional()
    @IsString({ message: 'Location must be a string' })
    location?: string;
  
    @IsOptional()
    @IsString({ message: 'Level must be a string' })
    level?: string;
  
    @IsOptional()
    @IsNumber({}, { message: 'Quantity must be a number' })
    quantity?: number;
  
    @IsOptional()
    @IsNumber({}, { message: 'Salary must be a number' })
    salary?: number;
  
    @IsNotEmpty({ message: 'Description must not be empty' })
    description: string;
  
    @IsNotEmpty({ message: 'Start date must not be empty' })
    @Transform(({ value }) => new Date(value))
    startDate: Date;
  
    @IsNotEmpty({ message: 'End date must not be empty' })
    @Transform(({ value }) => new Date(value))
    endDate: Date;
  
    @IsNotEmpty({ message: 'isReactive must not be empty' })
    @IsBoolean({ message: 'isReactive must be a boolean value' })
    isActive: boolean;
  }
  