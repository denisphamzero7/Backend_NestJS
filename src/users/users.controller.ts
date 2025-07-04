import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Public } from 'src/decorator/customize';
import { IUser } from './user.interface';



@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService,
   
  ) {}
  @Public()
  @Post()
  create(@Body()
   createUserDto: CreateUserDto) {
    // return "ok"
    return this.usersService.create(createUserDto);
  }
  @Public()
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
  @Public()
  @Get(':id')
  @Public()
  findOne(
  @Param('id')
   id: string
  ) {
    return this.usersService.findOne(id);
  }
  @Public()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id,updateUserDto);
  }
  @Public()
  @Delete(':id')
  remove(@Param('id') id: string,user:IUser) {
    return this.usersService.remove(id,user);
  }
}
