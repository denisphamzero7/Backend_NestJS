import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Company,CompanyDocument } from './schemas/company.schema';
import { InjectModel } from '@nestjs/mongoose';
import { IUser } from 'src/users/user.interface';
import aqp from 'api-query-params';
import { Types } from 'mongoose';
@Injectable()
export class CompaniesService {
  constructor(@InjectModel(Company.name) 
  private companyModel: SoftDeleteModel<CompanyDocument>) {}
  async create(createCompanyDto: CreateCompanyDto, user:IUser) {
    const company = await this.companyModel.create({...createCompanyDto,createBy:{
      _id:user._id,
      email:user.email
    }});
    console.log("<<<<< :",company);
    return {
      company,
      message:'create successful'
    }
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
  

    delete filter.page;
    delete filter.limit;
  

    const page = currentPage || 1;
    const defaultLimit = limit || 10;
    const offset = (page - 1) * defaultLimit;
  
    const totalItems = await this.companyModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);
  
    const result = await this.companyModel
      .find(filter, projection)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as { [key: string]: 1 | -1 })
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
  

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID format');
    }
    return await this.companyModel.findOne({_id:id});
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto,user:IUser) {
    const update =await this.companyModel.updateOne({_id:id},{
      ...updateCompanyDto,
      UpdatedBy:{
        _id:user._id,
        email:user.email
      }
    })
    return ({
      message: 'update company successfull',
      company:update
    })
  }

  async remove(id: string,user:IUser) {
    await this.companyModel.updateOne({_id:id},{
      deletedBy:{
        _id:user._id,
        email:user.email
      }
    })
    return this.companyModel.softDelete({
      _id:id
    })
  }
}
