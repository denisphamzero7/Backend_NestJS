import { IsDefined, IsEmail, IsNotEmpty, IsNotEmptyObject, IsObject, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import mongoose from 'mongoose';




class Company{
  @IsNotEmpty()
  _id:mongoose.Schema.Types.ObjectId;
  @IsNotEmpty()
  name:string
}
export class CreateUserDto {
  @IsNotEmpty({ message: 'Name must not be empty' })
  name: string;

  @IsEmail({}, { message: 'Email is invalid' })
  @IsNotEmpty({ message: 'Email must not be empty' })
  email: string;

  @IsNotEmpty({ message: 'Password must not be empty' })
  password: string;

  @IsNotEmpty({ message: 'Age must not be empty' })
  age: number;

  @IsNotEmpty({ message: 'phone must not be empty' })
  phone: number;

  @IsNotEmpty({ message: 'address not be empty' })
  address: string;
  
  @IsNotEmpty({ message: 'gender not be empty' })
  gender: string;

  @IsNotEmpty({ message: 'role not be empty' })
  role: string;
  
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => Company)
  company: Company;
}

export class RegisterUserDto {
  @IsNotEmpty({ message: 'Name must not be empty' })
  name: string;

  @IsEmail({}, { message: 'Email is invalid' })
  @IsNotEmpty({ message: 'Email must not be empty' })
  email: string;

  @IsNotEmpty({ message: 'Password must not be empty' })
  password: string;

  @IsNotEmpty({ message: 'Age must not be empty' })
  age: number;

  @IsNotEmpty({ message: 'gender not be empty' })
  gender: string;

  @IsNotEmpty({ message: 'phone must not be empty' })
  phone: number;

  @IsNotEmpty({ message: 'address not be empty' })
  address: string;
   
  @IsNotEmpty({ message: 'role not be empty' })
  role:string

}
