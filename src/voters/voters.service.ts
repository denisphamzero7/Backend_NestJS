import { Injectable } from '@nestjs/common';
import { CreateVoterDto, ScanVoterDto } from './dto/create-voter.dto';
import { UpdateVoterDto } from './dto/update-voter.dto';
import { Voter, VoterDocument } from './schemas/voter.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import { OnesignalService } from 'src/onesignal/onesignal.service';
import { NotificationService } from 'src/notifications/notification.service';


// 1. Import User Model để inject
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { NotificationType } from 'src/notifications/enums/notification-type.enum';

@Injectable()
export class VotersService {
  constructor(
    @InjectModel(Voter.name)
    private voterModel: SoftDeleteModel<VoterDocument>,

    // 2. Inject UserModel để tìm người đang thực hiện hành động
    @InjectModel(User.name)
    private userModel: SoftDeleteModel<UserDocument>,

    private oneSignalService: OnesignalService,
    private notificationService: NotificationService
  ) {}

  async create(createVoterDto: CreateVoterDto) {
    const { cccd, username, date, sex } = createVoterDto;
    const newVoter = await this.voterModel.create({
      cccd,
      username,
      date,
      sex,
      status: false
    });
    return {
      data: newVoter
    }
  }

  async findAll(currentPage: number, limit: number, qs: string) {
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

    // 1. Tìm kiếm cử tri
    const voter = await this.voterModel.findOne({ cccd: cccd });
    
    // Tìm user đang thao tác để lưu vào trường createBy của notification
    const currentUser = await this.userModel.findById(loggedInUserId);

    if (!voter) {
      return {
        message: 'Cử tri không tồn tại trong danh sách.',
        isSuccess: false,
        data: voter,
      };
    }

    // 2. Trường hợp: Cử tri ĐÃ BẦU trước đó
    if (voter.status === true) {
      const heading = 'Cảnh Báo: Cử tri đã bỏ phiếu';
      const content = `Cử tri ${voter.username} (CCCD: ${voter.cccd}) đã đi bầu trước đó. Vui lòng kiểm tra lại.`;

      // 2.1 Gửi OneSignal
      try {
        await this.oneSignalService.sendNotificationToUser(
          loggedInUserId,
          heading,
          content,
          { screen: 'voting_history', voter_id: voter._id.toString() }
        );
      } catch (error) {
        console.error('Lỗi OneSignal (đã bầu):', error);
      }

      // 2.2 LƯU DB (Thêm đoạn này để lưu thông báo lỗi)
      if (currentUser) {
        await this.notificationService.create(
          {
            title: heading,
            content: content,
            userId: loggedInUserId, // Người nhận thông báo
            type: NotificationType.VOTE_WARNING, // Loại thông báo cảnh báo
            isRead: false
          },
          currentUser as any // Người tạo thông báo (hệ thống/chính user đó)
        );
      }

      return {
        message: 'Cử tri này đã xác nhận đi bầu.',
        isSuccess: true, // Hoặc false tùy logic app bạn muốn hiển thị màu đỏ hay xanh
        data: voter,
      };
    }

    // 3. Cập nhật status (Chỉ chạy khi status là false)
    const updatedVoter = await this.voterModel.findByIdAndUpdate(
      voter._id,
      { status: true },
      { new: true }
    );

    // 4. Trường hợp: BẦU THÀNH CÔNG
    if (updatedVoter) {
      const heading = 'Xác Nhận Bầu Cử Thành Công';
      const content = `Bạn vừa xác nhận thành công cho cử tri ${updatedVoter.username} (CCCD: ${updatedVoter.cccd}).`;

      // 4.1 Gửi OneSignal
      try {
        await this.oneSignalService.sendNotificationToUser(
          loggedInUserId,
          heading,
          content,
          { screen: 'voting_history', voter_id: updatedVoter._id.toString() }
        );
      } catch (error) {
        console.error('Lỗi OneSignal (thành công):', error);
      }

      // 4.2 LƯU DB (Sửa lại tham số truyền vào cho đúng)
      if (currentUser) {
        try {
          await this.notificationService.create(
            {
              title: heading,
              content: content,
              userId: loggedInUserId,
              type: NotificationType.VOTE_SUCCESS,
              isRead: false
            },
            currentUser as any
          );
        } catch (error) {
          console.error('Lỗi lưu DB Notification:', error);
        }
      }
    }

    // 5. Trả về kết quả
    return {
      message: 'Xác nhận cử tri thành công. Status đã được cập nhật thành True.',
      isSuccess: true,
      data: updatedVoter,
    };
  }
  
  // Các hàm giữ nguyên
  findOne(id: number) { return `This action returns a #${id} voter`; }
  update(id: number, updateVoterDto: UpdateVoterDto) { return `This action updates a #${id} voter`; }
  remove(id: number) { return `This action removes a #${id} voter`; }
}