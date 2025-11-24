import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { VotersService } from './voters.service';
import { CreateVoterDto, ScanVoterDto } from './dto/create-voter.dto';
import { UpdateVoterDto } from './dto/update-voter.dto';
import { Public, ResponseMessage, SkipCheckPermission, User } from 'src/decorator/customize';
import { IUser } from 'src/users/user.interface';


@Controller('voters')
export class VotersController {
  constructor(private readonly votersService: VotersService) {}
  @Public()
  @SkipCheckPermission()
  @ResponseMessage('Tạo mới cử tri thành công')
  @Post()
  create(@Body() createVoterDto: CreateVoterDto) {
    return this.votersService.create(createVoterDto);

  }
 
  
  @Get()
  @Public()
  @ResponseMessage('danh sách cử tri') // Đã thêm
   findAll(
      @Query('page') currentPage: string, // Đã thêm
      @Query('limit') limit: string, // Đã thêm
      @Query() qs: string, // Đã thêm
    ) {
      // Thêm + để ép kiểu string sang number cho service
      return this.votersService.findAll(+currentPage, +limit, qs); 
    }
 
   @ResponseMessage('Xát nhận đã đi bầu') 
    @Post('scan') 
  async scanVoterCard(@Body() scanVoterDto: ScanVoterDto,@User() user: IUser) {
    return this.votersService.scanVoterCard(scanVoterDto,user._id);
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.votersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVoterDto: UpdateVoterDto) {
    return this.votersService.update(+id, updateVoterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.votersService.remove(+id);
  }
}
