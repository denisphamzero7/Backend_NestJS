// src/documents/documents.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

// --- Các import được CẬP NHẬT để giống hệt NewsController ---
import { IUser } from 'src/users/user.interface';
import { Public, ResponseMessage, User } from 'src/decorator/customize'; // 1. Thay đổi import

@Controller('documents')
// 2. Đã GỠ BỎ @UseGuards(JwtAuthGuard) (để khớp với file news.controller.ts)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @ResponseMessage('create document successfully') // 3. Thêm ResponseMessage
  create(
    @Body() createDocumentDto: CreateDocumentDto,
    @User() user: IUser,
  ) {
    return this.documentsService.create(createDocumentDto, user);
  }

  @Public() // Giữ nguyên
  @Get()
  @ResponseMessage('Fetch document list successfully') // 4. Thêm ResponseMessage
  findAll(
    @Query('page') currentPage: string,
    @Query('limit') limit: string,
    @Query('qs') qs: string,
  ) {
    return this.documentsService.findAll(+currentPage, +limit, qs);
  }

  // 5. Đã GỠ BỎ @Public() (để khớp với findOne của NewsController, ngụ ý route này cần auth)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @Patch(':id')
  // 6. Không thêm ResponseMessage (để khớp với NewsController)
  update(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
    @User() user: IUser,
  ) {
    return this.documentsService.update(id, updateDocumentDto, user);
  }

  @Delete(':id')
  // 7. Không thêm ResponseMessage (để khớp với NewsController)
  remove(
    @Param('id') id: string,
    @User() user: IUser,
  ) {
    return this.documentsService.remove(id, user);
  }
}