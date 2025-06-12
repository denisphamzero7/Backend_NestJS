import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type JobDocument = HydratedDocument<Job>;

@Schema({ timestamps: true })
export class Job {
  @Prop({ required: true })
  name: string;

  @Prop()
  skills: string [ ] 
  
  @Prop({ required: true })
  address: string;

  @Prop()
  description: string;

  // Fix: Define the type for createBy
  @Prop({ type: Object }) // Or define a sub-schema if createBy becomes more complex
  createBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  // Fix: Define the type for updatedBy
  @Prop({ type: Object }) // Or define a sub-schema
  updatedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  // Fix: Define the type for deleteBy
  @Prop({ type: Object }) // Or define a sub-schema
  deleteBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop()
  deleteAt: Date;

  @Prop()
  isDeleted: boolean;
}

export const JobSchema = SchemaFactory.createForClass(Job);