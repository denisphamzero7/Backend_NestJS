import { Controller, Get } from '@nestjs/common';
import { MailService } from './mail.service';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { MailerService } from '@nestjs-modules/mailer';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Subscriber, SubscriberDocument } from 'src/subscribers/schemas/subscriber.schema';
import { Job, JobDocument } from 'src/jobs/schemas/job.schemas';
import { InjectModel } from '@nestjs/mongoose';

@Controller('mail')
export class MailController {
  constructor(
    private readonly mailService: MailService,
    private mailerService: MailerService,
    @InjectModel(Subscriber.name)
    private subscriberModel: SoftDeleteModel<SubscriberDocument>,
    @InjectModel(Job.name)
    private jobModel: SoftDeleteModel<JobDocument>
  ) {}

  @Get()
  @Public()
  @ResponseMessage('Test email')
  async handleTestEmail() {
    const subscribers = await this.subscriberModel.find({});

    for (const subs of subscribers) {
      const subsSkills = subs.skills;
      const matchedJobs = await this.jobModel.find({ skills: { $in: subsSkills } }).populate('company');

      if (matchedJobs.length) {
        const jobs = matchedJobs.map((item) => ({
          name: item.name,
          company: item.company?.name || 'Unknown Company',
          salary: `${item.salary}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' đ',
          skills: item.skills,
        }));

        await this.mailerService.sendMail({
          to: subs.email,
          from: '"Support Team" <support@example.com>',
          subject: 'Việc làm phù hợp với bạn!',
          template: 'new-job',
          context: {
            receiver: subs.name || 'Bạn',
            job: jobs,
          },
        });
      }
    }
  }
}
