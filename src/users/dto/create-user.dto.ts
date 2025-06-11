import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import mongoose from 'mongoose';




class company{
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

  @IsNotEmpty({ message: 'address not be empty' })
  role: string
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

}
