// src/documents/documents.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Document, DocumentDocument } from './schemas/document.schema'; // 1. Thay đổi Model
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/user.interface'; // Giả định đường dẫn này đúng
import aqp from 'api-query-params';
import { Types } from 'mongoose';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(Document.name) // 2. Thay đổi Model name
    private documentModel: SoftDeleteModel<DocumentDocument>, // 3. Thay đổi Model type
  ) {}

  async create(createDocumentDto: CreateDocumentDto, user: IUser) {
    const document = await this.documentModel.create({
      ...createDocumentDto,
      createBy: {
        _id: user._id,
        email: user.email,
      },
    });
    console.log("djjd",document);
    return {
      document, // 4. Thay đổi tên biến trả về
      message: 'create document successful', // 5. Thay đổi message
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);

    delete filter.page;
    delete filter.limit;

    const page = currentPage || 1;
    const defaultLimit = limit || 10;
    const offset = (page - 1) * defaultLimit;

    // 6. Dùng documentModel
    const totalItems = await this.documentModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    // 7. Dùng documentModel
    const result = await this.documentModel
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
    // 8. Dùng documentModel
    const document = await this.documentModel.findOne({ _id: id });
    if (!document) {
      // 9. Thay đổi message lỗi
      throw new NotFoundException(`Không tìm thấy văn bản với ID: ${id}`);
    }
    return document;
  }

  async update(id: string, updateDocumentDto: UpdateDocumentDto, user: IUser) {
   
  }

  async remove(id: string, user: IUser) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    // 13. Dùng documentModel (Cập nhật deletedBy)
    await this.documentModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    // 14. Dùng documentModel (Gọi softDelete)
    const result = await this.documentModel.softDelete({
      _id: id,
    });

    if (result.deleted === 0) {
      // 15. Thay đổi message lỗi
      throw new NotFoundException(
        `Không tìm thấy văn bản với ID: ${id} để xoá`,
      );
    }

    return {
      message: 'delete document successful', // 16. Thay đổi message
      result,
    };
  }
}