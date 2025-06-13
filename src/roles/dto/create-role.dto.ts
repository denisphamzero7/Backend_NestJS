import { IsArray, IsBoolean, IsMongoId, IsNotEmpty } from "class-validator";
import mongoose from "mongoose";

export class CreateRoleDto {
    @IsNotEmpty({message:"Name is not empty"})
    name: string;
    
    @IsBoolean({message:"isActive not empty"})
    @IsNotEmpty({message:"Name is not empty"})
    isActive:boolean; 

    @IsNotEmpty({message:"description is not empty"})
    description: string;
    
    @IsNotEmpty({message:"permission not empty"})
    @IsMongoId({each:true,message:"each permissions is mongo object id"})
    @IsArray({message:'permissions is array'})
    permissions:mongoose.Schema.Types.ObjectId[];

}
