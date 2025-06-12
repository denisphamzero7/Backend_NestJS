import { Injectable } from '@nestjs/common';
import { CreateResumeDto, CreateUserCvDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { Resume, ResumeDocument } from './schemas/resume.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { IUser } from 'src/users/user.interface';
import { User } from 'src/decorator/customize';

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

  findAll() {
    return `This action returns all resumes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} resume`;
  }

  update(id: number, updateResumeDto: UpdateResumeDto) {
    return `This action updates a #${id} resume`;
  }

  remove(id: number) {
    return `This action removes a #${id} resume`;
  }
}
