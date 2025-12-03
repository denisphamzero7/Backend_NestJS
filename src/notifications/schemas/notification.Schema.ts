import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { NotificationType } from '../enums/notification-type.enum';


export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ timestamps: true })
export class Notification {
  // TỐI ƯU 1: Định nghĩa rõ ObjectId và ref để sau này có thể dùng .populate('userId')
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  // Dùng để biết bấm màn hình nào
  @Prop({required: true, enum: NotificationType})
  type: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({
    type: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      email: { type: String }
    }
  })

  updatedBy: {
    _id: mongoose.Types.ObjectId;
    email: string;
  };
    createBy: {
    _id: mongoose.Types.ObjectId;
    email: string;
  };
  deletedBy: {
    _id: mongoose.Types.ObjectId;
    email: string;
  };
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Index giúp query nhanh hơn, ví dụ lấy list noti của 1 user
NotificationSchema.index({ userId: 1, createdAt: -1 });