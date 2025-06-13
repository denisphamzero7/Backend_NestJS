import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { IUser } from 'src/users/user.interface';
import { ResponseMessage, User } from 'src/decorator/customize';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}
  @ResponseMessage("Create a new role")
  @Post()
  create(@Body() createRoleDto: CreateRoleDto, @User() user:IUser) {
    return this.rolesService.create(createRoleDto,user);
  }

  @ResponseMessage("Get all role") 
  @Get()
  @ResponseMessage("get list jobs")
  findAll(@Query("page") currentPage:string,
  @Query("limit") limit:string,
  @Query() qs:string
) {
    
    return this.rolesService.findAll(+currentPage,+limit,qs);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto,@User() user:IUser) {
    return this.rolesService.update(id, updateRoleDto,user);
  }

  @Delete(':id')
  remove(@Param('id') id: string,@User() user:IUser) {
    return this.rolesService.remove(id,user);
  }
}
