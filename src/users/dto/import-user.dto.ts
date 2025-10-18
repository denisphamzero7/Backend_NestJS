// src/users/dto/import-user.dto.ts

import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ExcelColumn } from 'src/decorator/customize';


export class ImportUserDto {
  @ExcelColumn('Tên Người Dùng')
  @IsNotEmpty()
  @IsString()
  name: string;

  @ExcelColumn('Email')
  @IsEmail()
  email: string;

  @ExcelColumn('Địa Chỉ')
  @IsOptional()
  @IsString()
  address?: string;

  @ExcelColumn('Giới Tính')
  @IsOptional()
  @IsString()
  gender?: string;

  @ExcelColumn('Tuổi')
  @IsOptional()
  age?: number;

   @ExcelColumn('Mật khẩu')
  @IsOptional()
  password?: string;



  @ExcelColumn('Công ty')
  company: string;
}