import { Module } from '@nestjs/common';
import { VotersService } from './voters.service';
import { VotersController } from './voters.controller';
import { Voter, VoterSchema } from './schemas/voter.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { OnesignalService } from 'src/onesignal/onesignal.service';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
      MongooseModule.forFeature([
        { name: Voter.name, schema: VoterSchema },
      ]),
      HttpModule,
      ConfigModule.forRoot({ isGlobal: true }),
    ],
  controllers: [VotersController],
  providers: [VotersService,OnesignalService,],
})
export class VotersModule {}
