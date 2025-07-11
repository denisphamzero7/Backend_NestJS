import { Controller, Get } from '@nestjs/common';
import { MailService } from './mail.service';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { MailerService } from '@nestjs-modules/mailer';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Subscriber, SubscriberDocument } from 'src/subscribers/schemas/subscriber.schema';
import { Job, JobDocument } from 'src/jobs/schemas/job.schemas';
import { InjectModel } from '@nestjs/mongoose';

import { Cron, CronExpression } from '@nestjs/schedule';


@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService,
    private mailerService: MailerService,
    @InjectModel(Subscriber.name) 
    private subscriberModel: SoftDeleteModel<SubscriberDocument>,
    @InjectModel(Job.name) 
    private jobModel: SoftDeleteModel<JobDocument>) {}
  @Cron("0 10 0 * * 0")// 0 giờ 10 phút mỗi ngày
  @Get()
  @Public()
  @ResponseMessage("Test email")
  async handleTestEmail() {
    const job =[
      {
        name:"fullstack development!!!!!!!!!!!!",
        company:"danatech",
        salary:"1000000",
        skills:["reactjs","vuejs","nodejs"]
      },
      {
        name:"frontend development!!!!!!!!!!!!",
        company:"danatech",
        salary:"1000000",
        skills:["reactjs","vuejs","nodejs"]
      },
      {
        name:"backend development!!!!!!!!!!!!",
        company:"danatech",
        salary:"1000000",
        skills:["C#","java","nodejs"]
      }
    ]
    const subscribers = await this.subscriberModel.find({  });
    for (const subs of subscribers) {
      const subsSkills = subs.skills;
      const jobWithMatchingSkills = await this.jobModel.find({ skills: { $in: subsSkills } })
      console.log("check",jobWithMatchingSkills);
      if (jobWithMatchingSkills.length) {
        const jobs = jobWithMatchingSkills.map((item) => {
          return {
            name: item.name,
            company: item.company?.name, 
            salary:
              `${item.salary}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' đ',
            skills: item.skills,
          };
        });
        await this.mailerService.sendMail({
          to: "haryphamdev@gmail.com",
          from: '"Support Team" <support@example.com>',
          subject: 'Welcome to Nice App! Confirm your Email',
          template: "new-job", 
          context:{
            receiver:subs.name,
            job:jobs
          }
        });
      

    }

    
  }

}

// @Cron(CronExpression.EVERY_30_SECONDS)
// getcon(){
//   console.log("text");
// }

}