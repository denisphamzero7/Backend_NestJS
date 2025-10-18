import { Module } from '@nestjs/common';
import { ExcelService } from './excel.service';

@Module({
  providers: [ExcelService],
  exports: [ExcelService],//cho các module khác sử dụng
})
export class ExcelModule {}
