import { PartialType } from '@nestjs/mapped-types';
import { CreateSubscriberDto } from './create-subscriber.dto';
import { Prop } from '@nestjs/mongoose';

export class UpdateSubscriberDto extends PartialType(CreateSubscriberDto) {
    
}
