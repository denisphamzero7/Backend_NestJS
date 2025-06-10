import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) 
  private userModel: SoftDeleteModel<UserDocument>) {}


  async gethashpassword(password: string) {
    const salt =  genSaltSync(10);
    const hash = hashSync(password,salt)
    return hash
  }

  async create(createUserDto: CreateUserDto) {
    const hashpassword = await this.gethashpassword(createUserDto.password);
    const user = await this.userModel.create({
      email: createUserDto.email,
      password: hashpassword,
    });
    return user;
  }

  async findAll() {
    const users = await this.userModel.find().select('-password');
    return users;
  }

  async findOne(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return 'User not found';
      }
      const user = await this.userModel.findOne({ _id: id }).select('-password');
      return user;
    } catch (error) {
      console.error(error);
      throw new Error('Internal server error');
    }
  }
  async findOneByUserName(username: string) {
    return this.userModel.findOne({email:username})
  }
 async Isvalidpassword(password: string, hash:string){
     return compareSync(password, hash); // true

 }
  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return 'id not valid';
      }
      const user = await this.userModel.findByIdAndUpdate({_id:id},updateUserDto, {
        new: true,
        runValidators: true,
      }).select('-password');;
      console.log('user :',user);
      if (!user) {
        return {message:'user not found'}
      }
      return user
    } catch (error) {
      console.error(error);
      throw new Error('Internal server error');
    }
  }

  async remove(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return { message: 'id not valid' };
      }
      const user = await this.userModel.softDelete({ _id: id });
      if (!user) {
        return 'User not found';
      }
      return { message: 'User deleted successfully' };
    } catch (error) {
      console.error(error);
      throw new Error('Internal server error');
    }
  }
}
