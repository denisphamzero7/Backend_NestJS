// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type MonitorlogDocument = HydratedDocument<Monitorlog>;

@Schema({ timestamps: true })
export class Monitorlog {
  @Prop()
  requestingDepartment: string;

  @Prop()
  timein: string;

  @Prop()
  timeout: string;

  // Tương ứng: "Loại công việc"
  @Prop()
  workType: string;

  @Prop()
  status: string;

  @Prop()
  area: string;

  // chi tiết công việc
  @Prop()
  description: string;

  // Kết quả
  @Prop()
  result: string;

  // Ghi chú
  @Prop()
  note: string;

  // người xử lý
  @Prop()
  handler:[];
  


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

export const MonitorlogSchema = SchemaFactory.createForClass(Monitorlog);
