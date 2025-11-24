// src/documents/dto/create-document.dto.ts
import {
  IsString,
  IsNotEmpty, // 1. Mặc dù import vẫn còn, nhưng chúng ta sẽ không dùng nó cho title/documentNumber
  IsOptional,
  IsDateString,
  IsIn,
} from 'class-validator';

// Các trạng thái (status) hợp lệ
const VALID_STATUSES = ['draft', 'published', 'expired'];

export class CreateDocumentDto {
  @IsString({ message: 'Tiêu đề phải là chuỗi' })
  @IsOptional() // 2. ĐÃ THÊM @IsOptional
  // 3. ĐÃ GỠ BỎ @IsNotEmpty
  title?: string; // 4. THÊM dấu '?' để đánh dấu đây là thuộc tính tùy chọn

  @IsString()
  @IsOptional()
  description?: string; 

  @IsString()
  @IsOptional() // 5. ĐÃ THÊM @IsOptional
  // 6. ĐÃ GỠ BỎ @IsNotEmpty
  documentNumber?: string; // 7. THÊM dấu '?'

  @IsString()
  @IsOptional()
  documentType?: string;

  @IsString()
  @IsOptional()
  issuer?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString() 
  @IsOptional()
  fileUrl?: string;

  @IsDateString({}, { message: 'Ngày ban hành phải là định dạng ISO 8601' })
  @IsOptional()
  publishedAt?: Date;

  @IsDateString({}, { message: 'Ngày có hiệu lực phải là định dạng ISO 8601' })
  @IsOptional()
  effectiveAt?: Date;

  @IsString()
  @IsIn(VALID_STATUSES, {
    message: `Trạng thái phải là một trong các giá trị: ${VALID_STATUSES.join(
      ', ',
    )}`,
  })
  @IsOptional()
  status?: string; 
}