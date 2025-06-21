import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role, RoleDocument } from './schemas/role.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/user.interface';
import { User } from 'src/decorator/customize';
import mongoose from 'mongoose';
import aqp from 'api-query-params';
import { throwError } from 'rxjs';


@Injectable()
export class RolesService {
  constructor(@InjectModel(Role.name) 
  private roleModel: SoftDeleteModel<RoleDocument>) {}


   async create(createRoleDto: CreateRoleDto,user:IUser) {

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

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
  

    delete filter.page;
    delete filter.limit;
  

    const page = currentPage || 1;
    const defaultLimit = limit || 10;
    const offset = (page - 1) * defaultLimit;
  
    const totalItems = await this.roleModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);
  
    const result = await this.roleModel
      .find(filter, projection)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .exec();
  
    return {
      result,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit: defaultLimit
      }
    };
  }


  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await this.roleModel.findOne({ _id: id }).populate('permissions');

  }

 async update(id: string, updateRoleDto: UpdateRoleDto,user:IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return 'not found role';
    }
    const{name, description, isActive, permissions} = updateRoleDto;
    // const IsExist = await this.roleModel.findOne({name})
    // if(IsExist){
    //   throw new BadRequestException(`role with name=${name} is exist`)
    // }
    const updateRole = await this.roleModel.updateOne({_id:id},{
      name, description, isActive, permissions,updatedBy:{
        _id:user._id,
        email:user.email
      }
    })
    return updateRole
  }

  async remove(id: string,user:IUser) {
    await this.roleModel.updateOne({_id:id},{
      deletedBy:{
        _id:user._id,
        email:user.email
      }
    })
    return this.roleModel.softDelete({
      _id:id
    })
    
  }
}
