import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { CreateResumeDto, CreateUserCvDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { IUser } from 'src/users/user.interface';
import { Public, User } from 'src/decorator/customize';

@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Post()
  create(@Body() createUserCvDto: CreateUserCvDto,
   @User() user: IUser) {
    return this.resumesService.create(createUserCvDto,user);
  }
  @Public()
  @Get()
  findAll(@Query("page") currentPage:string,
  @Query("limit") limit:string,
  @Query() qs:string) {
    return this.resumesService.findAll(+currentPage,+limit,qs);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resumesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body('status') updateResumeDto: UpdateResumeDto, @User() user:IUser) {
    return this.resumesService.update(id, updateResumeDto,user);
  }

  @Delete(':id')
  remove(@Param('id') id: string,@User() user:IUser) {
    return this.resumesService.remove(id,user);
  }
}
