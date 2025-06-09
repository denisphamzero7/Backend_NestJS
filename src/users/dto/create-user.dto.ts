import { IsEmail, IsNotEmpty } from 'class-validator';
export class CreateUserDto {
  @IsEmail({},{message:'email không hợp lệ'})
  email: string;

  @IsNotEmpty()
  password: string;

  name: string;
  age: string;

  phone: number;

  address: string;
}
