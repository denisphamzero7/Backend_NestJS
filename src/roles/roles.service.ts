import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role, RoleDocument } from './schemas/role.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/user.interface';
import { User } from 'src/decorator/customize';
import mongoose from 'mongoose';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role.name) 
  private roleModel: SoftDeleteModel<RoleDocument>) {}

   async create(createRoleDto: CreateRoleDto, @User() user:IUser) {
      const {name,description,isActive,permissions}= createRoleDto;
     const IsExit  = await this.roleModel.findOne({name})
     if(IsExit){
      throw new  BadRequestException(`Role with name=${name} is exit`)
     }
    const newRole = await this.roleModel.create({
      name,description,isActive,permissions,
      createBy:{
        _id: user?._id,
        email: user?.email
      }
    })
    return newRole

  }

  findAll() {
    return `This action returns all roles`;
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return 'id not valid';
    }
    return await this.roleModel.findOne({_id:id});
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return `This action updates a #${id} role`;
  }

  remove(id: number) {
    return `This action removes a #${id} role`;
  }
}
