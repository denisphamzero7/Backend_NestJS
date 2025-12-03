import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { Public, SkipCheckPermission, User } from 'src/decorator/customize';
import { IUser } from 'src/users/user.interface';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @SkipCheckPermission()
  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto, @User() user: IUser) {
    return this.notificationService.create(createNotificationDto, user);
  }

  // SỬA: FindAll này nên dùng cho Admin. 
  // Nếu dùng cho User App, cần filter theo userId.
  // Ở đây mình tạm giữ nguyên cho Admin, và thêm API 'mine' cho User bên dưới.
  @SkipCheckPermission()
  @Get()
  findAll(
    @Query('page') currentPage: string,
    @Query('limit') limit: string,
    @Query() qs: string,
  ) {
    return this.notificationService.findAll(+currentPage, +limit, qs);
  }

  // --- API MỚI 1: LẤY THÔNG BÁO CỦA TÔI (Cho App Flutter) ---
  // GET /notification/mine?page=1&limit=10
  @Get('mine')
  findAllMine(
    @User() user: IUser,
    @Query('page') currentPage: string,
    @Query('limit') limit: string,
    @Query() qs: string,
  ) {
    // Chúng ta cần sửa service findAll một chút để hỗ trợ filter userId, 
    // hoặc dùng qs: `userId=${user._id}&...`
    // Cách nhanh nhất là append userId vào query string 'qs'
    const query = qs ? `${qs}&userId=${user._id}` : `userId=${user._id}`;
    return this.notificationService.findAll(+currentPage, +limit, query);
  }

  // --- API MỚI 2: ĐẾM SỐ LƯỢNG CHƯA ĐỌC ---
  // GET /notification/unread-count
  @Get('unread-count')
  countUnread(@User() user: IUser) {
    return this.notificationService.countUnread(user._id);
  }

  // --- API MỚI 3: ĐÁNH DẤU ĐÃ ĐỌC (Tất cả) ---
  // PATCH /notification/read-all
  // Lưu ý: Đặt route này TRƯỚC route ':id' để tránh bị nhầm 'read-all' là một cái id
  @Patch('read-all')
  markAllAsRead(@User() user: IUser) {
    return this.notificationService.markAllAsRead(user._id);
  }

  // --- API MỚI 4: ĐÁNH DẤU ĐÃ ĐỌC (Một cái) ---
  // PATCH /notification/:id/read
  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @User() user: IUser) {
    return this.notificationService.markAsRead(id, user._id);
  }

  @SkipCheckPermission()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationService.findOne(id);
  }

  @SkipCheckPermission()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateNotificationDto,
    @User() user: IUser,
  ) {
    return this.notificationService.update(id, updateDto, user);
  }

  @SkipCheckPermission()
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.notificationService.remove(id, user);
  }
}