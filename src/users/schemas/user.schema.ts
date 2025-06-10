
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({timestamps:true})
export class User {
  @Prop({required:true})
  email: string;

  @Prop({required:true})
  password: string;

  @Prop()
  name: string;
  
  @Prop()
  age: number;

  @Prop()
  gender: string

  // @Prop()
  // company: ObjectId;

  @Prop()
  role: string;
  
  @Prop()
  phone: number;

  @Prop()
  address: string;

  @Prop()
  deleteAt: Date;

  @Prop()
  isDeleted: boolean
}

export const UserSchema = SchemaFactory.createForClass(User);
