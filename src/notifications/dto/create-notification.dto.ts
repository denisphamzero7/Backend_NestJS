import { IsArray, IsBoolean, IsMongoId, IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

export class CreateNotificationDto {
  @IsNotEmpty({ message: 'Id người dùng bắc buộc' })
  userId: string;

  @IsNotEmpty({ message: 'Tiêu đề bắt buộc' })
  title: string;

  type: string;

  content: string;

  isRead: boolean;

}
