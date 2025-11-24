import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { InjectModel } from '@nestjs/mongoose';
import { News, NewsDocument } from './schemas/news.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/user.interface'; // Đã thêm
import aqp from 'api-query-params'; // Đã thêm
import { Types } from 'mongoose'; // Đã thêm

@Injectable()
export class NewsService {
  constructor(
    @InjectModel(News.name)
    private newsModel: SoftDeleteModel<NewsDocument>,
  ) {}

  async create(createNewsDto: CreateNewsDto, user: IUser) { // Đã thêm user
    const news = await this.newsModel.create({
      ...createNewsDto,
      createBy: { // Thêm logic createBy
        _id: user._id,
        email: user.email,
      },
    });
    return {
      news,
      message: 'create successful',
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) { // Viết lại hoàn toàn
    const { filter, sort, projection, population } = aqp(qs);

    delete filter.page;
    delete filter.limit;

    const page = currentPage || 1;
    const defaultLimit = limit || 10;
    const offset = (page - 1) * defaultLimit;

    const totalItems = await this.newsModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.newsModel
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

  async findOne(id: string) { // Viết lại, sửa id: number -> id: string
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID format');
    }
    const news = await this.newsModel.findOne({ _id: id });
    if (!news) {
        throw new NotFoundException(`Không tìm thấy tin tức với ID: ${id}`);
    }
    return news;
  }

 async update(id: string, updateNewsDto: UpdateNewsDto, user: IUser) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID format');
    }

    // SỬA 1: Tham số đầu tiên chỉ là 'id' (dạng string)
    const updatedNews = await this.newsModel.findByIdAndUpdate(
      { _id: id }, // Chỉ cần id, không cần { _id: id }
      {
        ...updateNewsDto,
        updatedBy: { // Thêm logic updatedBy
          _id: user._id,
          email: user.email,
        },
      },
      {
        new: true, // Giữ nguyên, rất tốt!
      }
    ).exec(); // Thêm .exec() để thực thi query

    // SỬA 2: Kiểm tra xem 'updatedNews' có bị null hay không
    if (!updatedNews) {
        // Nếu không tìm thấy document, updatedNews sẽ là null
        throw new NotFoundException(`Không tìm thấy tin tức với ID: ${id} để cập nhật`);
    }

    return {
      message: 'update news successful',
      result: updatedNews, // Trả về chính tài liệu đã được cập nhật
    };
  }
  async remove(id: string, user: IUser) { // Viết lại
    if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid ID format');
    }

    // Thực hiện logic 2 bước giống hệt CompaniesService
    // Bước 1: Cập nhật deletedBy
    await this.newsModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    
    // Bước 2: Gọi softDelete
    const result = await this.newsModel.softDelete({
      _id: id,
    });

    if (result.deleted === 0) {
        throw new NotFoundException(`Không tìm thấy tin tức với ID: ${id} để xoá`);
    }

    return {
        message: 'delete news successful',
        result
    };
  }
}