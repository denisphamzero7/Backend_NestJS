import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ResumeDocument = HydratedDocument<Resume>;

@Schema({ timestamps: true })
export class Resume {
  @Prop()
  email: string;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' }) 
  userId: mongoose.Schema.Types.ObjectId;
  
  @Prop()
  status: string;

  @Prop()
  url: string;

  @Prop()
  job: mongoose.Schema.Types.ObjectId;
  
  @Prop()
  company: mongoose.Schema.Types.ObjectId;

  @Prop()
  history:{
    status:string;
    updatedAt:Date;
    updatedBy:{
        _id:mongoose.Schema.Types.ObjectId;
        email:string
    }
  }[]

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
  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ResumeSchema = SchemaFactory.createForClass(Resume);