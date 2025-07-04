import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';

import { IUser } from './user.interface';


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
    const existingEmail = await this.userModel.findOne({ email: createUserDto.email });
    if (existingEmail) {
      throw new BadRequestException(`Email already exists`);
    }
    const { name, email, age, gender, address, role, phone, company } = createUserDto;
    const newUser = await this.userModel.create({
      name,
      email,
      password: hashpassword,
      age,
      gender,
      address,
      role,
      phone,
      company,
    });
    console.log(newUser);
    return newUser;
  }
   async register(user: RegisterUserDto){
    const {name,email,password,age,gender,address,role}=user;
    const IsExist = await this.userModel.findOne({email})
    if (IsExist) {
      throw new ConflictException(`Email : ${email} already exists`);
    }
    const hashpassword= await this.gethashpassword(password);
    let newRegister =  await this.userModel.create({
      name,email,
      password:hashpassword,
      age,gender,address,role
    })
    return {
      data:newRegister 
    } 
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
      const user = await this.userModel.findOne({ _id: id }).populate({ path: 'role', select: 'name permissions' }) .select('-password');
      return user;
    } catch (error) {
      console.error(error);
      throw new Error('Internal server error');
    }
  }
  async findOneByUserName(username: string) {
    return await this.userModel
    .findOne({ email: username })
    .populate({ path: 'role', select: { name: 1, permissions: 1 } });
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

  async remove(id: string, user:IUser) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return { message: 'id not valid' };
      }
      const founduser = await this.userModel.findById(id)
             if(founduser.email==="admin@gmail.com")
              {
                throw new BadRequestException("not delete Admin !!!!!")
              }
    await this.userModel.updateOne({_id:id},{
      deletedBy:{
        _id:user._id,
        email:user._id
      }
    })
    return this.userModel.softDelete({
      _id: id
    })
    } catch (error) {
      console.error(error);
      throw new Error('Internal server error');
    }
  }
  
updateUserToken = async(refreshToken:string,_id:string)=>{
  return await this.userModel.updateOne({_id},
    {refreshToken}).populate({ path: 'role', select: { name: 1, permissions: 1 } });
}
findUserByToken = async (refreshToken:string)=>{
  return await this.userModel.findOne({refreshToken}).populate({ path: 'role', select: { name: 1, permissions: 1 } });
}
async findByIdWithPassword(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new NotFoundException('ID không hợp lệ');
  }

  return this.userModel.findById(id); // giữ lại cả password
}

async updatePassword(id:string, newPassword: string) {
  const hashedPassword = await this.gethashpassword(newPassword);

  const updatedUser = await this.userModel.findByIdAndUpdate(
    {_id:id},
    { password: hashedPassword },
    { new: true, runValidators: true } // đảm bảo validate nếu cần
  ).exec(); // thêm exec() để rõ ràng và dễ debug

  if (!updatedUser) {
    throw new NotFoundException('Không tìm thấy người dùng để cập nhật mật khẩu');
  }

  return updatedUser;
}
}