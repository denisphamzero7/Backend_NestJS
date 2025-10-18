import { IsArray, IsBoolean, IsMongoId, IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

export class CreateMonitorlogDto {
  @IsNotEmpty({ message: 'Đây câu hỏi bắt buộc' })
  workType: string;

  @IsNotEmpty({ message: 'Đây câu hỏi bắt buộc' })
  handler: string;

  @IsNotEmpty({ message: 'Đây câu hỏi bắt buộc' })
  timein: string;
  @IsNotEmpty({ message: 'Đây câu hỏi bắt buộc' })
  requestingDepartment: string;
  @IsNotEmpty({ message: 'Đây câu hỏi bắt buộc' })
  timeout: string;

   @IsNotEmpty({ message: 'Đây câu hỏi bắt buộc' })
  status: string;

   @IsNotEmpty({ message: 'Đây câu hỏi bắt buộc' })
  area: string;

   @IsNotEmpty({ message: 'Đây câu hỏi bắt buộc' })
  description: string;

   @IsNotEmpty({ message: 'Đây câu hỏi bắt buộc' })
  result: string;
@IsNotEmpty({ message: 'Đây câu hỏi bắt buộc' })
  note: string;

}
