import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { UsersModule } from 'src/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import {User , UserSchema } from 'src/users/schemas/user.schema';


@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),], 
  providers: [NotificationsGateway],
  exports: [NotificationsGateway],
})
export class NotificationModule {}