import { Module } from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { ResumesController } from './resumes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Resume, ResumeSchema } from './schemas/resume.schema';
import { Job, JobSchema } from 'src/jobs/schemas/job.schemas';
import { JobsService } from 'src/jobs/jobs.service';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';
import { User, UserSchema } from 'src/users/schemas/user.schema';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Resume.name, schema: ResumeSchema },{name: Job.name, schema: JobSchema},{name: User.name, schema: UserSchema}]),
  ],
  controllers: [ResumesController],
  providers: [ResumesService,JobsService, NotificationsGateway],
})
export class ResumesModule {}
