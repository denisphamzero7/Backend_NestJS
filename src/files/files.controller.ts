import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
  UseFilters,
  Headers,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/decorator/customize';
import { HttpExceptionFilter } from 'src/core/http-exception.filter';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}
  // @Public()
  // @Post('upload')
  // @UseInterceptors(FileInterceptor('file'))
  // uploadFile(@UploadedFile(new ParseFilePipeBuilder()
  //   .addFileTypeValidator({
  //     fileType: /^(jpg|jpeg|png|image\/png|gif|txt|application\/pdf|doc|docx|text\/plain)$/i,
  //   })
  //   .addMaxSizeValidator({
  //     maxSize: 357 * 1024
  //   })
  //   .build({
  //     errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
  //   }),
  // ) file: Express.Multer.File) {
  //   return {
  //     filName: file.filename
  //   }
  // }
  @Public()
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @UseFilters(new HttpExceptionFilter())
  uploadFile(@UploadedFile() file: Express.Multer.File,
  @Headers('folder_type') folderType: string,) {
    const folder = folderType ?? 'default';
    const accessUrl = `/images/${folder}/${file.filename}`;
    return {
      filName: file.filename,
      Url: accessUrl,
    };
  }

  @Get()
  findAll() {
    return this.filesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.filesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto) {
    return this.filesService.update(+id, updateFileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.filesService.remove(+id);
  }
}
