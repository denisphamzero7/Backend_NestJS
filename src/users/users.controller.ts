import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Res,
  Inject,
  Type,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Public, ResponseMessage, SkipCheckPermission, User } from 'src/decorator/customize';
import { IUser } from './user.interface';
import { ExcelService } from 'src/excel/excel.service';
import {ImportUserDto } from './dto/import-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  
  constructor(private readonly usersService: UsersService,private readonly excelService: ExcelService,
   
  ) {}
  @Public()
  @Post()
  create(
    @Body()
    createUserDto: CreateUserDto,  
  ) {
    // return "ok"
    return this.usersService.create(createUserDto);
  }
  @Public()
  @ResponseMessage('Get all user')
  @Get()
  findAll(
    @Query('page') currentPage: string,
    @Query('limit') limit: string,
    @Query() qs: string,
  ) {
    return this.usersService.findAll(+currentPage, +limit, qs);
  }

  @ResponseMessage('Get user profile')
  @SkipCheckPermission() // Bỏ qua kiểm tra quyền, vì user nào cũng có quyền xem profile của chính mình
  @Get('profile')
  getProfile(@User() user: IUser) {
    return user;
  }
 
 @Get('export')
 @ResponseMessage('export success')
  async exportUsers(@Res() res: Response) {
    // Assuming userModel and createUserDto are defined elsewhere in your code
    const users = await this.usersService.findAllForExport();
    console.log('data 123:',users);
    const buffer = await this.excelService.exportToBuffer(users, ImportUserDto);
    console.log('bufeee',buffer);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');
    res.send(buffer);
  }
  @Post('import')
  @ResponseMessage('Import users success')
  @UseInterceptors(FileInterceptor('file')) // 'file' là key của file trong form-data
  async importUsers(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Vui lòng upload một file Excel.');
    }

    // 1. Dùng ExcelService để đọc và validate file
    const validatedDtos = await this.excelService.importFromBuffer(
      file.buffer,
      ImportUserDto,
    );

    // 2. Dùng UsersService để xử lý logic tạo mới
    return this.usersService.importUsers(validatedDtos);
  }

  @Get(':id')
  @Public()
  findOne(
    @Param('id')
    id: string,
  ) {
    return this.usersService.findOne(id);
  }

   // cập nhật thông tin cá nhân người dùng
  @SkipCheckPermission()
  @ResponseMessage('Update user profile')
  @Patch('profile')
  updateProfile(@User() user:IUser, 
  @Body() updateUserDto: UpdateUserDto){
  return this.usersService.updateProfile(user._id,updateUserDto);
  }
  // cập nhật bởi admin
  @SkipCheckPermission()
  @ResponseMessage('Update admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }
 
  // xóa 
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
  }
 
}

