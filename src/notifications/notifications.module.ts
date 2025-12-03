import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { UsersModule } from 'src/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import {User , UserSchema } from 'src/users/schemas/user.schema';
import { Notification, NotificationSchema } from './schemas/notification.Schema';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';


@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema },{name: Notification.name, schema: NotificationSchema}]),], 
  controllers:[NotificationController],
  providers: [NotificationsGateway,NotificationService],
  exports: [NotificationsGateway,NotificationService],
})
export class NotificationModule {}