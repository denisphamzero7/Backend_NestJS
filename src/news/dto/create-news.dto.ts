import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsDateString,
  IsEnum,
} from 'class-validator';

// Bạn vẫn cần Enum để IsEnum có thể hoạt động
export enum NewsStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export class CreateNewsDto {
  @IsString()
  @IsNotEmpty() // Vẫn giữ IsNotEmpty: Nếu trường này được gửi, nó không được rỗng
  @IsOptional() // Đánh dấu là không bắt buộc phải gửi trường này
  title?: string; // Dấu ? là cú pháp TypeScript để chỉ property này là optional

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  content?: string;

  
  @IsOptional()
  imageUrl?: string;

  @IsDateString()
  @IsOptional()
  publishedAt?: Date;

  @IsEnum(NewsStatus)
  @IsOptional()
  status?: string;
}
