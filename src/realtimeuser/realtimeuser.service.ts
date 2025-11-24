

import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateRealtimeuserDto } from './dto/create-realtimeuser.dto';
import { UpdateRealtimeuserDto } from './dto/update-realtimeuser.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Realtimeuser, RealtimeuserDocument } from './schemas/realtimeuser.schema';
import aqp from 'api-query-params';
import { RealtimeUserNotificationsGateway } from './realuser.gateway';
import { IUser } from 'src/users/user.interface';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';


interface UserActionInfo {
  _id: string;
  email: string;
}

@Injectable()
export class RealtimeuserService {
constructor(
    @InjectModel(Realtimeuser.name)
    private realtimeuserModel: SoftDeleteModel<RealtimeuserDocument>,
    private readonly realtimeUserNotificationsGateway: RealtimeUserNotificationsGateway,
  ) {}


// realtimeuser.service.ts
async create(createRealtimeuserDto: CreateRealtimeuserDto, user: IUser) {
    const { name, phone, email } = createRealtimeuserDto;
    const executor: UserActionInfo = { _id: user._id, email: user.email };

    try {
        // Chỉ gọi DB 1 lần duy nhất
        const newUser = await this.realtimeuserModel.create({
            name,
            phone,
            email,
            createBy: executor,
        });

        this.realtimeUserNotificationsGateway.notifyUserCreated(newUser, executor);
        return newUser.toObject();

    } catch (error) {
        // Mã lỗi 11000 là lỗi trùng lặp key (Duplicate Key Error) của MongoDB
        if (error.code === 11000) {
            // Kiểm tra xem trường nào bị trùng để báo lỗi chính xác
            if (error.keyPattern?.name) {
                throw new BadRequestException(`Tên user "${name}" đã tồn tại!`);
            }
            // Nếu bạn set unique cho cả email hay phone thì check thêm ở đây
            if (error.keyPattern?.email) {
                throw new BadRequestException(`Email "${email}" đã tồn tại!`);
            }
        }
        
        // Nếu không phải lỗi trùng lặp thì ném lỗi gốc ra (Internal Server Error...)
        throw error;
    }
}

  // ... (findAll và findOne giữ nguyên) ...
  async findAll(currentPage: number, limit: number, qs: string) { // Viết lại hoàn toàn
    const { filter, sort, projection, population } = aqp(qs);

    delete filter.page;
    delete filter.limit;

    const page = currentPage || 1;
    const defaultLimit = limit || 10;
    const offset = (page - 1) * defaultLimit;

    const totalItems = await this.realtimeuserModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.realtimeuserModel
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
  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID format');
    }
    return await this.realtimeuserModel.findOne({ _id: id });
  }


async update(id: string, updateRealtimeuserDto: UpdateRealtimeuserDto, user: IUser) {
    try {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid ID format');
        }
        const updatedBy = { 
            _id: user._id, 
            email: user.email 
        };
        const updateData = {
            ...updateRealtimeuserDto,
            updatedBy: updatedBy,
        };
        const updatedUser = await this.realtimeuserModel.findByIdAndUpdate(
            id,        
            updateData,  
            {
                new: true,
                runValidators: true,
            }
        ).exec();
        if (!updatedUser) { 
            throw new NotFoundException(`Realtimeuser with ID "${id}" not found.`);
        }
        this.realtimeUserNotificationsGateway.notifyUserUpdated(updatedUser, updatedBy);
        return updatedUser;

    } catch (error) {
        console.error('Error updating realtime user:', error);
        if (error instanceof BadRequestException || error instanceof NotFoundException) {
            throw error;
        }
        throw new InternalServerErrorException('An internal server error occurred');
    }
}
  async remove(id: string, deleteInfo: UserActionInfo) {
    try {
        // 1. Check ID Valid (Y hệt mẫu)
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return { message: 'id not valid' };
        }

        // 2. Tìm user để check tồn tại (Y hệt mẫu)
        const foundUser = await this.realtimeuserModel.findById(id);
        if (!foundUser) {
             throw new NotFoundException(`Realtimeuser with ID "${id}" not found.`);
        }

        // 3. Update người xoá trước (Y hệt mẫu dùng updateOne)
        await this.realtimeuserModel.updateOne(
            { _id: id },
            {
                deletedBy: deleteInfo, // Lưu thông tin người xoá
            },
        );

        // 4. Gọi softDelete (Y hệt mẫu)
        const result = await this.realtimeuserModel.softDelete({
            _id: id,
        });

        // 5. Thêm Socket (Bắt buộc cho Realtime)
        this.realtimeUserNotificationsGateway.notifyUserDeleted(id, deleteInfo);

        return result;

    } catch (error) {
        // Catch lỗi (Y hệt mẫu)
        console.error(error);
        // Nếu muốn ném lỗi gốc ra ngoài để Controller bắt được 404/400 thì dùng dòng dưới, còn không thì dùng dòng throw new Error như mẫu
        if (error instanceof NotFoundException) throw error; 
        
        throw new Error('Internal server error');
    }}
}