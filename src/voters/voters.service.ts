import { Injectable } from '@nestjs/common';
import { CreateVoterDto, ScanVoterDto } from './dto/create-voter.dto';
import { UpdateVoterDto } from './dto/update-voter.dto';
import { Voter, VoterDocument } from './schemas/voter.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import { OnesignalService } from 'src/onesignal/onesignal.service';

@Injectable()
export class VotersService {
  constructor(
   @InjectModel(Voter.name)
   private voterModel: SoftDeleteModel<VoterDocument>,
   private oneSignalService: OnesignalService,
  ){}
  async create(createVoterDto: CreateVoterDto) {
    const {cccd,username,date,sex}= createVoterDto;
    const newVoter = await this.voterModel.create({
      cccd,
      username,
      date,
      sex,
      status:false
    })
    return {
      data:newVoter
    }

  }

   async findAll(currentPage: number, limit: number, qs: string) { // Viết lại hoàn toàn
    const { filter, sort, projection, population } = aqp(qs);

    delete filter.page;
    delete filter.limit;

    const page = currentPage || 1;
    const defaultLimit = limit || 10;
    const offset = (page - 1) * defaultLimit;

    const totalItems = await this.voterModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.voterModel
      .find(filter, projection)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .exec();

    return {
      data: result,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit: defaultLimit,
      },
    };
  }
  

 async scanVoterCard(scanVoterDto: ScanVoterDto, loggedInUserId: string) { 
    const { cccd } = scanVoterDto;
    console.log('CCCD được quét:', cccd);
    console.log('User ID đang quét:', loggedInUserId); // Log để kiểm tra

    // 1. Tìm kiếm cử tri
    const voter = await this.voterModel.findOne({ cccd: cccd });
    console.log('ccd:', voter);
    
    if (!voter) {
      return {
        message: 'Cử tri không tồn tại trong danh sách.',
        isSuccess: false,
        data: voter,
      };
    }

    // 2. Kiểm tra status (ĐÃ SỬA)
    if (voter.status === true) {
      
      // --- BƯỚC 2.1: THÊM LOGIC GỬI THÔNG BÁO "ĐÃ BẦU" ---
      try {
        const heading = 'Cử tri đã bỏ phiếu';
        const content = `Cử tri ${voter.username} (CCCD: ${voter.cccd}) đã đi bầu.`;
        
        await this.oneSignalService.sendNotificationToUser(
          loggedInUserId,
          heading,
          content,
          { screen: 'voting_history', voter_id: voter._id.toString() } 
        );
      } catch (error) {
        console.error('Lỗi khi gửi thông báo (đã bầu):', error);
      }
      // --- KẾT THÚC SỬA ĐỔI ---

      // Vẫn return như cũ để báo cho app biết
      return {
        message: 'Cử tri này đã xác nhận đi bầu.',
        isSuccess: true,
        data: voter,
      };
    }

    // 3. Cập nhật status (Chỉ chạy khi status là false)
    const updatedVoter = await this.voterModel.findByIdAndUpdate(
      voter._id, 
      { status: true },
      { new: true }
    );
    
    // 4. GỌI ONESIGNAL (Chỉ chạy khi status là false)
    if (updatedVoter) {
      try {
        const heading = 'Xác Nhận Bầu Cử Thành Công';
        const content = `Bạn vừa xác nhận thành công cho cử tri ${updatedVoter.username} (CCCD: ${updatedVoter.cccd}).`;
        
        await this.oneSignalService.sendNotificationToUser(
          loggedInUserId, 
          heading,
          content,
          { screen: 'voting_history', voter_id: updatedVoter._id.toString() } 
        );
      } catch (error) {
        console.error('Lỗi khi gửi thông báo (bầu mới):', error);
      }
    }
    
    // 5. Trả về (Chỉ chạy khi status là false)
    return {
      message: 'Xác nhận cử tri thành công. Status đã được cập nhật thành True.',
      isSuccess: true,
      data: updatedVoter,
    };
  }
  findOne(id: number) {
    return `This action returns a #${id} voter`;
  }

  update(id: number, updateVoterDto: UpdateVoterDto) {
    return `This action updates a #${id} voter`;
  }

  remove(id: number) {
    return `This action removes a #${id} voter`;
  }
}
