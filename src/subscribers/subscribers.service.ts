import { Injectable } from '@nestjs/common';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { Subscriber } from 'rxjs';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { SubscriberDocument } from './schemas/subscriber.schema';
import { IUser } from 'src/users/user.interface';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class SubscribersService {
  constructor(@InjectModel(Subscriber.name) 
  private subscriberModel: SoftDeleteModel<SubscriberDocument>) {}
  create(createSubscriberDto: CreateSubscriberDto,user:IUser) {
    const newsubscriber = this.subscriberModel.create({...createSubscriberDto,createdBy:{
      _id:user._id,
      email:user.email
    }})
    return newsubscriber
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
  

    delete filter.page;
    delete filter.limit;
  

    const page = currentPage || 1;
    const defaultLimit = limit || 10;
    const offset = (page - 1) * defaultLimit;
  
    const totalItems = await this.subscriberModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);
  
    const result = await this.subscriberModel
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

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
  
    return await this.subscriberModel.findOne({ _id: id });
  }
 async update(id: string, updateSubscriberDto: UpdateSubscriberDto,user:IUser) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return 'not found role';
  }
    const {name,email,skills}=updateSubscriberDto
    const updateSubscriber = await this.subscriberModel.updateOne({_id:id},{name,email,skills,updatedBy:{
      _id:user._id,
      email:user.email
    }})
    return updateSubscriber
  }

  remove(id: number) {
    return `This action removes a #${id} subscriber`;
  }
}
