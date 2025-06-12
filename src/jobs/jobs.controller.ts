import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/user.interface';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}
  @ResponseMessage("New a job successful")
  @Post()
  create(@Body() createJobDto: CreateJobDto) {
    return this.jobsService.create(createJobDto);
  }
   
  @Public()
  @Get()
  @ResponseMessage("get list jobs")
  findAll(@Query("page") currentPage:string,
  @Query("limit") limit:string,
  @Query() qs:string
) {
    
    return this.jobsService.findAll(+currentPage,+limit,qs);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(+id);
  }
  @ResponseMessage("Updated a job successful")
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto, @User() user:IUser ) {
    return this.jobsService.update(id,updateJobDto,user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobsService.remove(+id);
  }
}
