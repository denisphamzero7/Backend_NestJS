
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, ObjectId } from 'mongoose';
import { Role } from 'src/roles/schemas/role.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({timestamps:true})
export class User {
  @Prop({required:true})
  email: string;
 
  @Prop()
  name: string;

  @Prop()
  age: number;

  @Prop({required:true})
  password: string;
 
  @Prop()
  gender: string


  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Role.name })
  role: mongoose.Schema.Types.ObjectId;
  
  @Prop()
  phone: number;

  @Prop()
  address: string;
  
  @Prop({type:Object})
  company:{
    _id: mongoose.Schema.Types.ObjectId;
    name:string;
  }

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

export const UserSchema = SchemaFactory.createForClass(User);
