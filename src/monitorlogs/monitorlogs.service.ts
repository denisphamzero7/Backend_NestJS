import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateMonitorlogDto } from './dto/create-monitorlog.dto';
import { UpdateMonitorlogDto } from './dto/update-monitorlog.dto';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Monitorlog, MonitorlogDocument } from './schemas/monitorlog.Schema';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import { Types } from 'mongoose';
import { IUser } from 'src/users/user.interface';

@Injectable()
export class MonitorlogsService {

  constructor(
      @InjectModel(Monitorlog.name)
      private monitorlogModel: SoftDeleteModel<MonitorlogDocument>,
    ) {}
  async create( createMonitorlogDto:  CreateMonitorlogDto, user: IUser) {
     const data = await this.monitorlogModel.create({
       ... createMonitorlogDto,
       createBy: {
         _id: user._id,
         email: user.email,
       },
     });
     console.log('<<<<< :', data);
     return {
       data,
       message: 'create successful',
     };
   }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);

    delete filter.page;
    delete filter.limit;

    const page = currentPage || 1;
    const defaultLimit = limit || 10;
    const offset = (page - 1) * defaultLimit;

    const totalItems = await this.monitorlogModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.monitorlogModel
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
        limit: defaultLimit,
      },
    };
  }


async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID format');
    }
    return await this.monitorlogModel.findOne({ _id: id });
  }

 async update(id: string, updateMonitorlogDto: UpdateMonitorlogDto, user: IUser) {
     const update = await this.monitorlogModel.updateOne(
       { _id: id },
       {
         ...updateMonitorlogDto,
         updatedBy: {
           _id: user._id,
           email: user.email,
         },
       },
     );
 
     return update;
   }
  async remove(id: string, user: IUser) {
    await this.monitorlogModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return this.monitorlogModel.softDelete({
      _id: id,
    });
  }
  
}

