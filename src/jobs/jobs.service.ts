import { Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Job, JobDocument } from './schemas/job.schemas';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';

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

  findAll() {
    return `This action returns all jobs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} job`;
  }

  update(id: number, updateJobDto: UpdateJobDto) {
    return `This action updates a #${id} job`;
  }

  remove(id: number) {
    return `This action removes a #${id} job`;
  }
}
