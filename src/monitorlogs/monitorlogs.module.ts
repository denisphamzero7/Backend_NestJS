import { Module } from '@nestjs/common';
import { MonitorlogsService } from './monitorlogs.service';
import { MonitorlogsController } from './monitorlogs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Monitorlog, MonitorlogSchema } from './schemas/monitorlog.Schema';

@Module({
  imports: [
      MongooseModule.forFeature([
        { name: Monitorlog.name, schema: MonitorlogSchema }
      ]),
    ],
  controllers: [MonitorlogsController],
  providers: [MonitorlogsService]
})
export class MonitorlogsModule {
  
}
