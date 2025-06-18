import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Public, ResponseMessage, SkipCheckPermission, User } from 'src/decorator/customize';
import { IUser } from 'src/users/user.interface';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @SkipCheckPermission()
  @ResponseMessage("Create a new permission")
  create(@Body() createPermissionDto: CreatePermissionDto,
  @User() user: IUser
) {
    return this.permissionsService.create(createPermissionDto,user);
  }

  @Get()
 
  @ResponseMessage("Get all permission")
  findAll(@Query("page") currentPage:string,
  @Query("limit") limit:string,
  @Query() qs:string
) {
    
    return this.permissionsService.findAll(+currentPage,+limit,qs);
  }

  @Get(':id')
  @ResponseMessage("Get a permission")
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto, @User() user: IUser) {
    return this.permissionsService.update(id, updatePermissionDto,user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.permissionsService.remove(id,user);
  }
}
