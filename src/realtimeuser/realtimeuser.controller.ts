import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RealtimeuserService } from './realtimeuser.service';
import { CreateRealtimeuserDto } from './dto/create-realtimeuser.dto';
import { UpdateRealtimeuserDto } from './dto/update-realtimeuser.dto';
import { Public, ResponseMessage, SkipCheckPermission, User } from 'src/decorator/customize';
import { IUser } from 'src/users/user.interface';

@Controller('realtimeuser')
export class RealtimeuserController {
  constructor(private readonly realtimeuserService: RealtimeuserService) {}

  @Post()
  @ResponseMessage('Create user successfully')
  create(@Body() createRealtimeuserDto: CreateRealtimeuserDto, @User() user: IUser) {
    // 💡 THAY ĐỔI: Giống ResumesController, truyền DTO và User riêng biệt
    return this.realtimeuserService.create(createRealtimeuserDto, user);
  }

  @Public() // Đã thêm
   @Get()
   @ResponseMessage('Fetch user successfully') // Đã thêm
   findAll(
     @Query('page') currentPage: string, // Đã thêm
     @Query('limit') limit: string, // Đã thêm
     @Query() qs: string, // Đã thêm
   ) {
     // Thêm + để ép kiểu string sang number cho service
     return this.realtimeuserService.findAll(+currentPage, +limit, qs); 
   }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.realtimeuserService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Update user successfully')
  update(
    @Param('id') id: string,
    @Body() updateRealtimeuserDto: UpdateRealtimeuserDto,
    @User() user: IUser, // Lấy @User
  ) {
    console.log('DTO TRONG CONTROLLER:', updateRealtimeuserDto);
    // Chỉ truyền (id, dto, user)
    return this.realtimeuserService.update(id,updateRealtimeuserDto,user);
  }


  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    const deleteInfo = {
      _id: user._id,
      email: user.email,
    };
    return this.realtimeuserService.remove(id, deleteInfo);
  }
}
