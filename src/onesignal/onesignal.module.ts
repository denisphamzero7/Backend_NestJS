import { Module } from '@nestjs/common';
import { OnesignalService } from './onesignal.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports:[ConfigModule.forRoot({ isGlobal: true }),HttpModule,],
  providers: [OnesignalService]
})
export class OnesignalModule {}
