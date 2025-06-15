import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SubscribersService } from './subscribers.service';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { Public, ResponseMessage, SkipCheckPermission, User } from 'src/decorator/customize';
import { IUser } from 'src/users/user.interface';
import { skip } from 'rxjs';

@Controller('subscribers')
export class SubscribersController {
  constructor(private readonly subscribersService: SubscribersService) {}

  
  @Post()
  @ResponseMessage("Create a new Subscriber")
  create(@Body() createSubscriberDto: CreateSubscriberDto,@User() user:IUser) {
    return this.subscribersService.create(createSubscriberDto,user);
  }


 
  @Post("skills")
  @ResponseMessage("Get Subscriber's skills")
  @SkipCheckPermission()
  getUserSkills(@User() user:IUser){
    return this.subscribersService.getskills(user)
  }

  @Get()
  @Public()
  findAll(
  @Query("page") currentPage:string,
  @Query("limit") limit:string,
  @Query() qs:string) {
    return this.subscribersService.findAll(+currentPage,+limit,qs);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subscribersService.findOne(id);
  }
  @Patch()
 @SkipCheckPermission()
  update(@Body() updateSubscriberDto: UpdateSubscriberDto,@User() user:IUser) {
    return this.subscribersService.update( updateSubscriberDto,user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subscribersService.remove(id);
  }
}
