// src/realtimeuser/dto/update-realtimeuser.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateRealtimeuserDto } from './create-realtimeuser.dto';

export class UpdateRealtimeuserDto extends PartialType(CreateRealtimeuserDto) {}