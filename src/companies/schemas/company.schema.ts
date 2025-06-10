import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type CompanyDocument = HydratedDocument<Company>;

@Schema({ timestamps: true })
export class Company {
  @Prop({ required: true })
  name: string;

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

export const CompanySchema = SchemaFactory.createForClass(Company);