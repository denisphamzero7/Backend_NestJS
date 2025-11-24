import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type VoterDocument = HydratedDocument<Voter>;

@Schema({ timestamps: true })
export class Voter {
  @Prop()
  cccd: String;
  
  @Prop()
  username: String;

  @Prop()
  date: String;
  @Prop()
  sex: String;
  @Prop()
  status: boolean;
  @Prop({ type: Object }) 
  createBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop({ type: Object }) 
  updatedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop({ type: Object }) 
  deleteBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop()
  isDeleted: boolean;
}

export const VoterSchema = SchemaFactory.createForClass(Voter);
