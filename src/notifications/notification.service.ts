import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Notification,NotificationDocument } from './schemas/notification.Schema';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import { Types } from 'mongoose';
import { IUser } from 'src/users/user.interface';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationService {

  constructor(
      @InjectModel(Notification.name)
      private notificationModel: SoftDeleteModel<NotificationDocument>,
    ) {}
  async create( createNotificationDto:  CreateNotificationDto, user: IUser) {
     const data = await this.notificationModel.create({
       ... createNotificationDto,
       createBy: {
         _id: user._id,
         email: user.email,
       },
     });
     console.log('<<<<< :', data);
     return {
       data,
       message: 'create successful',
     };
   }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);

    delete filter.page;
    delete filter.limit;

    const page = currentPage || 1;
    const defaultLimit = limit || 10;
    const offset = (page - 1) * defaultLimit;

    const totalItems = await this.notificationModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.notificationModel
      .find(filter, projection)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .exec();

    return {
      result,
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
    return await this.notificationModel.findOne({ _id: id });
  }

 async update(id: string, updateNotificationDto: UpdateNotificationDto, user: IUser) {
     const update = await this.notificationModel.updateOne(
       { _id: id },
       {
         ...updateNotificationDto,
         updatedBy: {
           _id: user._id,
           email: user.email,
         },
       },
     );
 
     return update;
   }
  async remove(id: string, user: IUser) {
    await this.notificationModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return this.notificationModel.softDelete({
      _id: id,
    });
  }
  // đếm chưa đọc (nhờ index)
  async countUnread(userId: string){
    const count = await this.notificationModel.countDocuments({
      userId,
      isRead:false,
    });
    return{count}
  }
  // đánh dấu 1 cái đã đọc
  async markAsRead(id:string, userId:string){
    return this.notificationModel.updateOne(
      {_id:id,userId},
      {isRead: true}
    );
  }
  // đánh dấu tất cả đã đọc
  async markAllAsRead(userId:string){
    return this.notificationModel.updateMany(
      { userId, isRead: false },
      { isRead: true }
    )
  }
  
}

