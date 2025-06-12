import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Job, JobDocument } from './schemas/job.schemas';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import { Types } from 'mongoose';
import { IUser } from 'src/users/user.interface';

@Injectable()
export class JobsService {
  constructor(@InjectModel(Job.name) 
  private jobModel: SoftDeleteModel<JobDocument>) {}
  async create(createJobDto: CreateJobDto) {
    const {name,skills,company,location,salary,quantity,level,description,startDate,endDate,isActive}=createJobDto
    const newJob = await this.jobModel.create({
      name,skills,company,location,salary,quantity,level,description,startDate,endDate,isActive
    })
    return newJob
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
  

    delete filter.page;
    delete filter.limit;
  

    const page = currentPage || 1;
    const defaultLimit = limit || 10;
    const offset = (page - 1) * defaultLimit;
  
    const totalItems = await this.jobModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);
  
    const result = await this.jobModel
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
        limit: defaultLimit
      }
    };
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID format');
    }
    return await this.jobModel.findOne({_id:id});
  }

  async update(id: string, updateJobDto: UpdateJobDto,user:IUser) {
    const update =await this.jobModel.findByIdAndUpdate({_id:id},{
      ...updateJobDto,
      UpdatedBy:{
        _id:user._id,
        email:user.email
      }
    })
    console.log("update: ", update);
    return update
  }

  remove(id: number) {
    return `This action removes a #${id} job`;
  }
}
