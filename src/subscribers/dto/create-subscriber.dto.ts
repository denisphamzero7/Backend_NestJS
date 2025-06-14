import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class CreateSubscriberDto {
    @IsNotEmpty({message:"Name not empty"})
    name:string

    @IsNotEmpty({message:"Email not empty"})
    email:string


    @IsNotEmpty({message:"Skills not empty"})
    @IsArray({message:"Skills is array"})
    @IsString({each:true,message:"Skill is string"})
    skills:string[]
}
