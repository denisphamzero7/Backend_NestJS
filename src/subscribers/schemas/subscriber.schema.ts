import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
export type SubscriberDocument = HydratedDocument<Subscriber>
@Schema({ timestamps: true })
export class Subscriber {

    @Prop()
    name:string;

    @Prop()
    email:string;

    @Prop()
    skills:string[];
    @Prop()
  isActive:boolean;
  
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
  deleteAt: Date;

  @Prop()
  isDeleted: boolean;
}
export const SubscriberSchema = SchemaFactory.createForClass(Subscriber);