import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query, // Đã thêm
} from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { IUser } from 'src/users/user.interface'; // Đã thêm
import { Public, ResponseMessage, User } from 'src/decorator/customize'; // Đã thêm

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post()
   @ResponseMessage('create news list successfully')
  create(@Body() createNewsDto: CreateNewsDto, @User() user: IUser) { // Đã thêm user
    return this.newsService.create(createNewsDto, user); // Đã truyền user
  }

  @Public() // Đã thêm
  @Get()
  @ResponseMessage('Fetch news list successfully') // Đã thêm
  findAll(
    @Query('page') currentPage: string, // Đã thêm
    @Query('limit') limit: string, // Đã thêm
    @Query() qs: string, // Đã thêm
  ) {
    // Thêm + để ép kiểu string sang number cho service
    return this.newsService.findAll(+currentPage, +limit, qs); 
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.newsService.findOne(id); // Đã bỏ +id
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNewsDto: UpdateNewsDto,
    @User() user: IUser, // Đã thêm user
  ) {
    return this.newsService.update(id, updateNewsDto, user); // Đã bỏ +id và truyền user
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @User() user: IUser, // Đã thêm user
  ) {
    return this.newsService.remove(id, user); // Đã bỏ +id và truyền user
  }
}