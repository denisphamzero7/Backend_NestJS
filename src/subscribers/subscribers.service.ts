import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { Subscriber, retry } from 'rxjs';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { SubscriberDocument } from './schemas/subscriber.schema';
import { IUser } from 'src/users/user.interface';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class SubscribersService {
  constructor(
    @InjectModel(Subscriber.name)
    private subscriberModel: SoftDeleteModel<SubscriberDocument>,
  ) {}
  async create(createSubscriberDto: CreateSubscriberDto, user: IUser) {
    const {name,email,skills}= createSubscriberDto
    const isExist= await this.subscriberModel.findOne({email})
    if(isExist){
      throw new BadRequestException(` this is ${email} existing `)
    }
    const newsub = this.subscriberModel.create({
      name,email,skills,
      createdBy: {
        _id: user?._id,
        email: user?.email,
      },
    });
    return newsub;
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
        limit: defaultLimit,
      },
    };
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    return await this.subscriberModel.findOne({ _id: id });
  }
  async update(updateSubscriberDto: UpdateSubscriberDto, user: IUser) {
    const { name, email, skills } = updateSubscriberDto;
    const updateSubscriber = await this.subscriberModel.updateOne(
      { email: user.email },
      {
        name,
        email,
        skills,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
      { upsert: true },
    ); //upsert: có nghĩa là nếu người dùng chưa dk bảng subscriber thì tạo còn không có thì update//
    return updateSubscriber;
  }
  async getskills(user: IUser) {
    const { email } = user;
    const skills = await this.subscriberModel.findOne({ email }, { skills: 1 }).exec();
    if(!skills){
      throw new BadRequestException(`Subscriber with email ${email} not found` )
    }
    return skills
  }
  async remove(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { message: 'Invalid ID' };
    }

    const deleted = await this.subscriberModel.softDelete({ _id: id });

    return deleted;
  }
}
