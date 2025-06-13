import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateResumeDto, CreateUserCvDto, } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { Resume, ResumeDocument } from './schemas/resume.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { IUser } from 'src/users/user.interface';
import { User } from 'src/decorator/customize';
import aqp from 'api-query-params';
import { Types } from 'mongoose';

@Injectable()
export class ResumesService {
  constructor(@InjectModel(Resume.name) 
  private resumeModel: SoftDeleteModel<ResumeDocument>) {}
 async create(createUserCvDto: CreateUserCvDto, @User() user: IUser) {
  const {url, job, company } = createUserCvDto;
  const {email,_id} = user
  const newCV = await this.resumeModel.create({
    email,
    url,
    job,
    company,
    userId:_id,
    status: 'PENDING',
    createBy: {
      _id: user._id,
      email: user.email,
    },
    history: [
      {
        status: 'PENDING',
        updatedAt: new Date(),
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    ],
  });

  return {
    _id: newCV?._id,
    createAt:newCV?.createdAt
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
        limit: defaultLimit
      }
    };
  }
  

  async findOne(id:string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID format');
    }
    return await this.resumeModel.findOne({_id:id});

  }

  async update(id: string, updateResumeDto: UpdateResumeDto, user: IUser) {
    const result = await this.resumeModel.updateOne(
      { _id: id },
      {
        $set: {
          status: updateResumeDto.status,
          updatedBy: {
            _id: user._id,
            email: user.email,
          },
        },
        $push: {
          history: {
            status: updateResumeDto.status,
            updatedAt: new Date(),
            updatedBy: {
              _id: user._id,
              email: user.email,
            },
          },
        },
      }
    );
  
    if (result.modifiedCount === 0) {
      throw new Error('Resume not found or nothing updated');
    }
  
    return result
  
  }
  async remove(id: string,user:IUser) {
    await this.resumeModel.updateOne({_id:id},{
      deletedBy:{
        _id:user._id,
        email:user.email
      }
    })
    return this.resumeModel.softDelete({
      _id:id
    })
  }
}
