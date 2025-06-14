import { Injectable } from '@nestjs/common';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { Subscriber } from 'rxjs';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { SubscriberDocument } from './schemas/subscriber.schema';
import { IUser } from 'src/users/user.interface';

@Injectable()
export class SubscribersService {
  constructor(@InjectModel(Subscriber.name) 
  private subscriberModel: SoftDeleteModel<SubscriberDocument>) {}
  create(createSubscriberDto: CreateSubscriberDto,user:IUser) {
    const newsubscriber = this.subscriberModel.create({...createSubscriberDto,createBy:{
      _id:user._id,
      email:user.email
    }})
    return newsubscriber
  }

  findAll() {
    return `This action returns all subscribers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} subscriber`;
  }

  update(id: number, updateSubscriberDto: UpdateSubscriberDto) {
    return `This action updates a #${id} subscriber`;
  }

  remove(id: number) {
    return `This action removes a #${id} subscriber`;
  }
}
