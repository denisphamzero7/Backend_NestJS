import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Company } from 'src/companies/schemas/company.schema';

export type JobDocument = HydratedDocument<Job>;


@Schema({ timestamps: true })
export class Job {
  @Prop({ required: true })
  name: string;

  @Prop()
  skills: string [] 
  
 
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Company' })
  company: Company;



  @Prop()
  description: string;

  @Prop()
  location: string
 
  @Prop()
  level: string

  @Prop()
  startDate: Date

  @Prop()
  endDate: Date

  @Prop()
  quantity: number

  @Prop()
  salary: number

  @Prop()
  isActive: boolean

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
  deletedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop()
  deleteAt: Date;

  @Prop()
  isDeleted: boolean;
}

export const JobSchema = SchemaFactory.createForClass(Job);