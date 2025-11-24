
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type RealtimeuserDocument = HydratedDocument<Realtimeuser>;

@Schema({ timestamps: true })
export class Realtimeuser {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  phone: string;

  @Prop()
  email: string;

  @Prop({ type: Object }) // Or define a sub-schema if createBy becomes more complex
    createBy: {
      _id: mongoose.Schema.Types.ObjectId;
      email: string;
    };
  
  @Prop({ type: Object }) // Or define a sub-schema
    updatedBy: {
      _id: mongoose.Schema.Types.ObjectId;
      email: string;
    };
  

  @Prop({ type: Object }) // Or define a sub-schema
    deleteBy: {
      _id: mongoose.Schema.Types.ObjectId;
      email: string;
    }

}

export const RealtimeuserSchema = SchemaFactory.createForClass(Realtimeuser);
