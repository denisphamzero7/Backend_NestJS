import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateResumeDto, CreateUserCvDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { Resume, ResumeDocument } from './schemas/resume.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { IUser } from 'src/users/user.interface';
import { User } from 'src/decorator/customize';
import aqp from 'api-query-params';
import { Types } from 'mongoose';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';
import { Job, JobDocument } from 'src/jobs/schemas/job.schemas';
@Injectable()
export class ResumesService {
  constructor(
    @InjectModel(Resume.name)
    private resumeModel: SoftDeleteModel<ResumeDocument>,
    @InjectModel(Job.name)
    private jobModel: SoftDeleteModel<JobDocument>,
    private readonly notificationsGateway: NotificationsGateway
  ) {}
   async create(createUserCvDto: CreateUserCvDto, @User() user: IUser) {
    const { url, job, company } = createUserCvDto;
    const { email, _id, name } = user; // Lấy thêm `name` từ user

    const newCV = await this.resumeModel.create({
      email,
      url,
      job,
      company,
      userId: _id,
      status: 'PENDING',
      history: [
        {
          status: 'PENDING',
          updatedAt: new Date(),
          updatedBy: { _id, email },
        },
      ],
      createBy: { _id, email },
    });

    // CHANGED: GỌI GATEWAY VỚI PAYLOAD CÓ CẤU TRÚC
    const jobInfo = await this.jobModel.findById(job);
    if (jobInfo) {
      this.notificationsGateway.notifyNewApplication({
        companyId: company.toString(),
        jobTitle: jobInfo.name,
        candidateName: name, // Sử dụng tên user thay vì email
      });
    }

    return {
      _id: newCV?._id,
      createAt: newCV?.createdAt,
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);

    delete filter.page;
    delete filter.limit;

    const page = currentPage || 1;
    const defaultLimit = limit || 10;
    const offset = (page - 1) * defaultLimit;

    const totalItems = await this.resumeModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.resumeModel
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
    return await this.resumeModel.findOne({ _id: id });
  }

  async update(id: string, updateResumeDto: UpdateResumeDto, user: IUser) {
    const { status } = updateResumeDto;
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID của CV không hợp lệ');
    }

    // IMPROVEMENT: Tối ưu hóa bằng findByIdAndUpdate
    // Gộp 3 câu lệnh (findById, updateOne, findById) thành 1 câu lệnh duy nhất.
    const updatedCv = await this.resumeModel.findByIdAndUpdate(
      id,
      {
        $set: {
          status: status,
          updatedBy: { _id: user._id, email: user.email },
        },
        $push: {
          history: {
            status: status,
            updatedAt: new Date(),
            updatedBy: { _id: user._id, email: user.email },
          },
        },
      },
      { new: true } // Tùy chọn này sẽ trả về document SAU KHI đã cập nhật
    ).populate<{ job: JobDocument }>('job'); // Populate trực tiếp trong câu lệnh

    if (!updatedCv) {
      throw new NotFoundException(`Không tìm thấy CV với id=${id}`);
    }

    // CHANGED: GỬI THÔNG BÁO SAU KHI CẬP NHẬT THÀNH CÔNG
    
    // 1. Thông báo cho ứng viên
    this.notificationsGateway.notifyStatusUpdate({
      userId: updatedCv.userId.toString(),
      jobTitle: updatedCv.job?.name ?? 'Công việc đã bị xóa',
      status: updatedCv.status,
    });

    // 2. Thông báo đồng bộ cho các HR trong cùng công ty
    this.notificationsGateway.notifyCompanyOfCvUpdate(
      updatedCv.company.toString(),
      updatedCv
    );

    return { message: 'Cập nhật trạng thái CV thành công' };
  }
  async remove(id: string, user: IUser) {
    await this.resumeModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return this.resumeModel.softDelete({
      _id: id,
    });
  }
  async findByUsers(user: IUser) {
    console.log('User info:', user);
    const data = await this.resumeModel.find({
      userId: user._id,
    });
    console.log('user data: ', data);

    return data;
  }
}
