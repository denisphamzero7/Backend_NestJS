import { PartialType } from '@nestjs/mapped-types';
import { CreateMonitorlogDto } from './create-monitorlog.dto';

export class UpdateMonitorlogDto extends PartialType(CreateMonitorlogDto) {}
