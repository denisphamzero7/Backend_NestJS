

import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString
} from 'class-validator';


export class CreateVoterDto {
  @IsNotEmpty({ message: 'cccd is required' })
  cccd: string;

  @IsNotEmpty({ message: 'user is required' })
  username: string;
  
  @IsNotEmpty({ message: 'sex is required' })
  sex: string;

  @IsNotEmpty({ message: 'date is required' })
  date: string;

  status:boolean
}
export class ScanVoterDto {
@IsNotEmpty({ message: 'CCCD không được để trống' })
  @IsString()
  cccd: string;

 @IsString()
   @IsOptional()
    username?: string;

    @IsOptional()
    @IsString()
    date?: string;

    @IsOptional()
    @IsString()
    sex?: string;
}