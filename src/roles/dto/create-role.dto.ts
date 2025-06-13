import { IsArray, IsMongoId, IsNotEmpty } from "class-validator";
import mongoose from "mongoose";

export class CreateRoleDto {
    @IsNotEmpty({ message: 'Name is required' })
    name : string;

    @IsNotEmpty({ message: 'Description is required' })
    description:string


    @IsNotEmpty({ message: 'IsActive is required' })
    isActive:boolean

    @IsNotEmpty({ message: 'permissions is required' })
    @IsMongoId({ message: 'permissions must be a valid MongoDB ObjectId' })
    @IsArray({message: 'permissions must be a valid MongoDB ObjectId'})
    permissions: mongoose.Schema.Types.ObjectId[];
}
