import { PartialType } from '@nestjs/mapped-types';
import { CreateResumeDto } from './create-resume.dto';
import { IsArray, IsEmail, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';
import { Transform } from 'class-transformer';
class UpdateBy{
    @IsNotEmpty()
    _id:Types.ObjectId;

    @IsNotEmpty()
    @IsEmail()
    email:string
}

class History{
    @IsNotEmpty()
    status:string;
    
    updatedAt:Date


    @ValidateNested()
    @IsNotEmpty()
    @Type(()=>UpdateBy)
    updatedBy: UpdateBy
}
export class UpdateResumeDto extends PartialType(CreateResumeDto) {
    @IsNotEmpty({ message: 'status is required' })
    @IsString()
    @Transform(({ value }) => value?.trim()) // để loại bỏ khoảng trắng thừa
    status: string;


}
