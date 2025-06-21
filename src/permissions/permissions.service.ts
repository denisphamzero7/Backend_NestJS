import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission, PermissionDocument } from './schemas/permission.Schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/decorator/customize';
import { IUser } from 'src/users/user.interface';
import aqp from 'api-query-params';

@Injectable()
export class PermissionsService {
  constructor(@InjectModel(Permission.name) 
  private permissionModel: SoftDeleteModel<PermissionDocument>) {}

 async create(createPermissionDto: CreatePermissionDto,
   @User() user: IUser) {
    const {name, apiPath, method, module} = createPermissionDto;

    const IsExit = await this.permissionModel.findOne({apiPath,method});
    if (IsExit){
      throw new  BadRequestException(`Permission with apiPath=${apiPath},method=${method} are exitting`)
    }
    const newPermission = await this.permissionModel.create({
      name, apiPath, method, module,
      createBy:{
        _id: user._id,
        email: user.email
      }
    })
    return newPermission
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
  

    delete filter.page;
    delete filter.limit;
  

    const page = currentPage || 1;
    const defaultLimit = limit || 10;
    const offset = (page - 1) * defaultLimit;
  
    const totalItems = await this.permissionModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);
  
    const result = await this.permissionModel
      .find(filter, projection)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .exec();
  
    return {
      data: result,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit: defaultLimit
      }
    };
  }
  

  findOne(id:string) {
 const result = this.permissionModel.findOne({_id:id})
 return result
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto,user:IUser) {
    const update =await this.permissionModel.updateOne({_id:id},{
      ...updatePermissionDto,
      updatedBy:{
        _id:user._id,
        email:user.email
      }
    },{upsert:true})
    return ({
      message: 'update company successfull',
      company:update
    })
  }

  async remove(id: string,user:IUser) {
    await this.permissionModel.updateOne({_id:id},{
      deletedBy:{
        _id:user._id,
        email:user.email
      }
    })
    return this.permissionModel.softDelete({
      _id:id
    })
  }
}
