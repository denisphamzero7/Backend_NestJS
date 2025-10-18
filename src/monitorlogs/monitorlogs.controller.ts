import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MonitorlogsService } from './monitorlogs.service';
import { CreateMonitorlogDto } from './dto/create-monitorlog.dto';
import { UpdateMonitorlogDto } from './dto/update-monitorlog.dto';
import { Public, SkipCheckPermission, User } from 'src/decorator/customize';
import { IUser } from 'src/users/user.interface';

@Controller('monitorlogs')
export class MonitorlogsController {
  constructor(private readonly monitorlogsService: MonitorlogsService) {}
@SkipCheckPermission()
@Post()
  create(@Body() createMonitorlogDto: CreateMonitorlogDto, @User() user: IUser) {
    console.log('<<<<<user :', user);
    return this.monitorlogsService.create(createMonitorlogDto, user);
  }

  @Public()
   @Get()
   findAll(
     @Query('page') currentPage: string,
     @Query('limit') limit: string,
     @Query() qs: string,
   ) {
     return this.monitorlogsService.findAll(+currentPage, +limit, qs);
   }
@SkipCheckPermission()
@Get(':id')
  findOne(@Param('id') id: string) {
    return this.monitorlogsService.findOne(id);
  }

 @SkipCheckPermission()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMonitorlogDto: UpdateMonitorlogDto,
    @User() user: IUser,
  ) {
    return this.monitorlogsService.update(id, updateMonitorlogDto, user);
  }
  @SkipCheckPermission()
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.monitorlogsService.remove(id, user);
  }
  
}
