
import { IsArray, IsBoolean, IsMongoId, IsNotEmpty } from "class-validator";
import mongoose from "mongoose";

export class CreatePermissionDto {
    @IsNotEmpty({message:"Name is not empty"})
    name: string;
    

    @IsNotEmpty({message:"apiPath is not empty"})
    apiPath: string;
    

    @IsNotEmpty({message:"method is not empty"})
    method: string;

    @IsNotEmpty({message:"module is not empty"})
    module: string;

}
