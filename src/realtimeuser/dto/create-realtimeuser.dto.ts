// src/realtimeuser/dto/create-realtimeuser.dto.ts
import { Transform } from 'class-transformer';
import {
    IsString,
    IsNotEmpty,
    IsEmail,
} from 'class-validator';


export class CreateRealtimeuserDto {
    // escape giúp làm sạch dữ liệu
   @Transform(({ value }) => escape(value))
    @IsString() // <-- THÊM DÒNG NÀY
    @IsNotEmpty()
    name: string; 

    @IsString() // <-- THÊM DÒNG NÀY
    @IsNotEmpty() 
    phone: string; 

    @IsEmail() // <-- SỬA DÒNG NÀY
    @IsNotEmpty()
    email: string;
}