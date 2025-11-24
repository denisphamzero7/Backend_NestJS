import { Module } from '@nestjs/common';
import { RealtimeuserService } from './realtimeuser.service';
import { RealtimeuserController } from './realtimeuser.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Realtimeuser, RealtimeuserSchema } from './schemas/realtimeuser.schema';
import { RealtimeUserNotificationsGateway } from './realuser.gateway';

@Module({
  imports: [
    // Đăng ký Schema/Model với Mongoose Module
    MongooseModule.forFeature([{ name: Realtimeuser.name, schema: RealtimeuserSchema }]),
  ],
  controllers: [RealtimeuserController],
  providers: [RealtimeuserService,RealtimeUserNotificationsGateway],
  exports: [RealtimeuserService]
})
export class RealtimeuserModule {}
