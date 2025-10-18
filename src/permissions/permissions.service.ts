import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission, PermissionDocument } from './schemas/permission.Schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/decorator/customize';
import { IUser } from 'src/users/user.interface';
import aqp from 'api-query-params';
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(Permission.name)
    private permissionModel: SoftDeleteModel<PermissionDocument>,
    @InjectModel(Role.name)
    private roleModel: SoftDeleteModel<RoleDocument>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto, @User() user: IUser) {
    const { name, apiPath, method, module } = createPermissionDto;

    const IsExit = await this.permissionModel.findOne({ apiPath, method });
    if (IsExit) {
      throw new BadRequestException(
        `Permission with apiPath=${apiPath},method=${method} are exitting`,
      );
    }
    const newPermission = await this.permissionModel.create({
      name,
      apiPath,
      method,
      module,
      createBy: {
        _id: user._id,
        email: user.email,
      },
    });
    return newPermission;
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
    // danh sách page permission
    const result = await this.permissionModel
      .find(filter, projection)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .lean()
      .exec();
    // Chuẩn bị danh sách permission id dưới dạng string, chuyển sang dạng string an toàn nếu objectid
    const permIds = result.map((p) => p._id.toString());
    if (permIds.length === 0) {
      return {
        data: result.map((p) => ({ ...p, assignedRoles: [] })),
        pagination: {
          totalItems,
          totalPages,
          currentPage: page,
          limit: defaultLimit,
        },
      };
    }
    // lấy tất cả roles có chưa permission trong permids
    const roles = await this.roleModel
      .find({ permissions: { $in: permIds } })
      .select('_id name permissions')
      .lean() //làm giảm overhead mongoosse giup ít tốn tài nguyên
      .exec();
    // map permissonId -> [role]
    console.log('danh sách role', roles);

    const map = new Map<string, Array<{ _id: any; name: string }>>();
    for (const role of roles) {
      for (const pid of role.permissions || []) {
        const key = pid.toString();
        if (!map.has(key)) map.set(key, []);
        map.get(key)?.push({ _id: role._id, name: role.name });
      }
    }
    //5, gán assignRole vào mỗi permission
    const data = result.map((p) => ({
      ...p,
      assignedRoles: map.get(p._id.toString()) || [],
    }));

    return {
      data,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit: defaultLimit,
      },
    };
  }

  findOne(id: string) {
    const result = this.permissionModel.findOne({ _id: id });
    return result;
  }

  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
    user: IUser,
  ) {
    const update = await this.permissionModel.updateOne(
      { _id: id },
      {
        ...updatePermissionDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
      { upsert: true },
    );
    return {
      message: 'update company successfull',
      company: update,
    };
  }

  async remove(id: string, user: IUser) {
    await this.permissionModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return this.permissionModel.softDelete({
      _id: id,
    });
  }
}
