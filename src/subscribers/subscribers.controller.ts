import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SubscribersService } from './subscribers.service';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/user.interface';

@Controller('subscribers')
export class SubscribersController {
  constructor(private readonly subscribersService: SubscribersService) {}
  @Public()
  @ResponseMessage("Create a new Subscriber")
  @Post()
  create(@Body() createSubscriberDto: CreateSubscriberDto,@User() user:IUser) {
    return this.subscribersService.create(createSubscriberDto,user);
  }
  @Public()
  @Get()
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

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSubscriberDto: UpdateSubscriberDto,@User() user:IUser) {
    return this.subscribersService.update(id, updateSubscriberDto,user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subscribersService.remove(id);
  }
}
