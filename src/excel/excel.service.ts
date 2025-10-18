import { Injectable, BadRequestException, Type } from '@nestjs/common';
import * as xlsx from 'xlsx';
import { validate, getMetadataStorage } from 'class-validator'; // Import thêm getMetadataStorage
import { plainToInstance } from 'class-transformer';
import 'reflect-metadata';
import { EXCEL_COLUMN_KEY } from 'src/decorator/customize';

@Injectable()
export class ExcelService {
  /**
   * Đọc metadata từ DTO bằng cách sử dụng metadata storage của class-validator.
   * Đây là cách mạnh mẽ và chính xác nhất để lấy tất cả các thuộc tính đã định nghĩa.
   */
  private generateColumnMapping<Dto extends object>(dto: Type<Dto>): Record<string, string> {
    const metadataStorage = getMetadataStorage();
    // Lấy tất cả các thuộc tính đã được định nghĩa validation trong DTO
    const targetMetadatas = metadataStorage.getTargetValidationMetadatas(dto, null, false, false);
    // Dùng Set để đảm bảo tên thuộc tính là duy nhất
    const properties = [...new Set(targetMetadatas.map(metadata => metadata.propertyName))];
    
    const columnMapping = {};
    
    // Lặp qua các thuộc tính đã tìm thấy
    for (const prop of properties) {
        const hasMetadata = Reflect.hasMetadata(EXCEL_COLUMN_KEY, dto.prototype, prop);
        if (hasMetadata) {
            const columnName = Reflect.getMetadata(EXCEL_COLUMN_KEY, dto.prototype, prop);
            if (columnName) {
                columnMapping[columnName] = prop;
            }
        }
    }

    return columnMapping;
  }

  /**
   * EXPORT: Chuyển đổi một mảng dữ liệu thành file Excel buffer.
   */
  async exportToBuffer<Dto extends object>(data: any[], dto: Type<Dto>): Promise<Buffer> {
    const columnMapping = this.generateColumnMapping(dto);

    if (Object.keys(columnMapping).length === 0) {
      throw new BadRequestException(
        'DTO không có decorator @ExcelColumn nào được định nghĩa, hoặc DTO không có validator.',
      );
    }

    const excelHeaders = Object.keys(columnMapping);
    const dataForExport = data.map((doc) => {
      const row = {};
      for (const header of excelHeaders) {
        const propName = columnMapping[header];
        row[header] = doc[propName];
      }
      return row;
    });

    const worksheet = xlsx.utils.json_to_sheet(dataForExport);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Data');
    return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * IMPORT: Đọc dữ liệu từ buffer, validate và trả về một mảng DTOs.
   */
  async importFromBuffer<Dto extends object>(
    buffer: Buffer,
    dto: Type<Dto>,
  ): Promise<Dto[]> {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData: any[] = xlsx.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      throw new BadRequestException('File Excel không có dữ liệu.');
    }

    const validationErrors = [];
    const validatedDtos: Dto[] = [];

    for (let i = 0; i < jsonData.length; i++) {
      const rowData = jsonData[i];
      const dtoInstance = plainToInstance(dto, rowData);
      const errors = await validate(dtoInstance);

      if (errors.length > 0) {
        validationErrors.push({
          row: i + 2,
          errors: errors.map((err) => Object.values(err.constraints)).flat(),
        });
      } else {
        validatedDtos.push(dtoInstance);
      }
    }

    if (validationErrors.length > 0) {
      throw new BadRequestException({
        message: 'Dữ liệu trong file Excel không hợp lệ.',
        errors: validationErrors,
      });
    }

    return validatedDtos;
  }
}

