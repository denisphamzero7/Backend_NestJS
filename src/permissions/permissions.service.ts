import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission, PermissionDocument } from './schemas/permission.Schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/decorator/customize';
import { IUser } from 'src/users/user.interface';

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
  }

  findAll() {
    return `This action returns all permissions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} permission`;
  }

  update(id: number, updatePermissionDto: UpdatePermissionDto) {
    return `This action updates a #${id} permission`;
  }

  remove(id: number) {
    return `This action removes a #${id} permission`;
  }
}
