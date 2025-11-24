import { PartialType } from '@nestjs/mapped-types';
import { CreateOnesignalDto } from './create-onesignal.dto';

export class UpdateOnesignalDto extends PartialType(CreateOnesignalDto) {}
