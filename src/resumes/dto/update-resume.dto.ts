import { PartialType } from '@nestjs/mapped-types';
import { CreateResumeDto } from './create-resume.dto';
import { IsArray, IsEmail, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';
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
    @IsNotEmpty()
    @IsArray({message:'history is array'})
    @ValidateNested()
    history: History
}
