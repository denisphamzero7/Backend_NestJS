import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type NewsDocument = HydratedDocument<News>;

@Schema({ timestamps: true }) // timestamps: true sẽ tự động thêm createdAt và updatedAt
export class News {
  @Prop()
  title: string;
  @Prop()
  description: string; // Thêm: Mô tả ngắn/tóm tắt cho tin tức

  @Prop()
  content: string; // Thêm: Nội dung chi tiết của bài viết (có thể là HTML hoặc Markdown)

  @Prop()
  imageUrl: string; // Đường dẫn ảnh (ví dụ: 'assets/images/tin1.jpg')

  @Prop()
  publishedAt: Date; // Ngày đăng (lưu dưới dạng Date sẽ tốt hơn là string)

  @Prop()
  status: string; // Trạng thái (ví dụ: 'draft', 'published', 'archived')

  // ----- Các trường theo dõi và quản lý tương tự như Resume -----

  @Prop({ type: Object })
  createBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop({ type: Object })
  updatedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop({ type: Object })
  deleteBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop()
  deleteAt: Date;

  @Prop()
  isDeleted: boolean;

  // Bạn không cần khai báo createdAt và updatedAt ở đây
  // vì @Schema({ timestamps: true }) ở trên đã tự động thêm chúng rồi.
}

// eslint-disable-next-line prettier/prettier
export const NewsSchema = SchemaFactory.createForClass(News);