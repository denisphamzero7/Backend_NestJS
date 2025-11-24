// src/documents/schemas/document.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

// Đổi tên 'NewsDocument' thành 'DocumentDocument'
export type DocumentDocument = HydratedDocument<Document>;

// Đổi tên class 'News' thành 'Document'
@Schema({ timestamps: true }) // Giữ nguyên timestamps
export class Document {
  @Prop({ required: true })
  title: string; // Tiêu đề văn bản (Giống như trong ListTile: 'Nghị quyết / Luật...')

  @Prop()
  description: string; // Mô tả ngắn (Giống như trong ListTile subtitle)

  @Prop()
  documentNumber: string; // Số hiệu văn bản (Rất quan trọng, cũng từ subtitle)

  @Prop()
  documentType: string; // Loại văn bản (VD: "Nghị quyết", "Luật", "Thông tư")

  @Prop()
  issuer: string; // Cơ quan ban hành (VD: "Chính phủ", "Quốc hội")

  @Prop()
  content: string; // Nội dung chi tiết của văn bản (có thể là HTML hoặc Markdown)

  @Prop()
  fileUrl: string; // Đường dẫn đến file PDF, .doc, .xls (rất phổ biến cho văn bản)

  @Prop()
  publishedAt: Date; // Ngày ban hành (dùng để sắp xếp 'Văn bản mới')

  @Prop()
  effectiveAt: Date; // Ngày có hiệu lực (quan trọng cho văn bản pháp luật)

  @Prop({ default: 'draft' })
  status: string; // Trạng thái (VD: 'draft', 'published', 'expired')

  // ----- Các trường theo dõi và quản lý (Giữ nguyên từ NewsSchema) -----

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

  @Prop({ default: false }) // Thêm default value
  isDeleted: boolean;

  // createdAt và updatedAt đã được tự động thêm bởi @Schema({ timestamps: true })
}

// Đổi tên 'NewsSchema' thành 'DocumentSchema'
// eslint-disable-next-line prettier/prettier
export const DocumentSchema = SchemaFactory.createForClass(Document);