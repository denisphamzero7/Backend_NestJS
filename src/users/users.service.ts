import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';

import { IUser } from './user.interface';
import aqp from 'api-query-params';
import { Role } from 'src/roles/schemas/role.schema';
import { ImportUserDto } from './dto/import-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: SoftDeleteModel<UserDocument>,
  ) {}

  async gethashpassword(password: string) {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  }

  async create(createUserDto: CreateUserDto) {
    const hashpassword = await this.gethashpassword(createUserDto.password);
    const existingEmail = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (existingEmail) {
      throw new BadRequestException(`Email already exists`);
    }
    const { name, email, age, gender, address, role, phone, company } =
      createUserDto;
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
  async register(user: RegisterUserDto) {
    const { name, email, password, age, gender, address, role } = user;
    const IsExist = await this.userModel.findOne({ email });
    if (IsExist) {
      throw new ConflictException(`Email : ${email} already exists`);
    }
    const hashpassword = await this.gethashpassword(password);
    const newRegister = await this.userModel.create({
      name,
      email,
      password: hashpassword,
      age,
      gender,
      address,
      role,
    });
    return {
      data: newRegister,
    };
  }
  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);

    delete filter.page;
    delete filter.limit;

    const page = currentPage || 1;
    const defaultLimit = limit || 10;
    const offset = (page - 1) * defaultLimit;

    const totalItems = await this.userModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel
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
        limit: defaultLimit,
      },
    };
  }
  async findOne(id: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return 'User not found';
      }
      const user = await this.userModel
        .findOne({ _id: id })
        .populate({ path: 'role', select: 'name permissions' })
        .select('-password');
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
  
  async Isvalidpassword(password: string, hash: string) {
    return compareSync(password, hash); // true
  }
  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return 'id not valid';
      }
      // Hash password if it's being updated
      if (updateUserDto.password) {
        const hash = await this.gethashpassword(updateUserDto.password);
        updateUserDto.password = hash;
      }

      const user = await this.userModel
        .findByIdAndUpdate({ _id: id }, updateUserDto, {
          new: true,
          runValidators: true,
        })
        .select('-password'); // Exclude password from response
      console.log('user :', user);
      if (!user) {
        return { message: 'user not found' };
      }
      
      return user;
    } catch (error) {
      console.error(error);
      throw new Error('Internal server error');
    }
  }

  async remove(id: string, user: IUser) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return { message: 'id not valid' };
      }
      const founduser = await this.userModel.findById(id);
      if (founduser.email === 'admin@gmail.com') {
        throw new BadRequestException('not delete Admin !!!!!');
      }
      await this.userModel.updateOne(
        { _id: id },
        {
          deletedBy: {
            _id: user._id,
            email: user._id,
          },
        },
      );
      return this.userModel.softDelete({
        _id: id,
      });
    } catch (error) {
      console.error(error);
      throw new Error('Internal server error');
    }
  }

  updateUserToken = async (refreshToken: string, _id: string) => {
    return await this.userModel
      .updateOne({ _id }, { refreshToken })
      .populate({ path: 'role', select: { name: 1, permissions: 1 } });
  };

  findUserByToken = async (refreshToken: string) => {
    return await this.userModel
      .findOne({ refreshToken })
      .populate({ path: 'role', select: { name: 1, permissions: 1 } });
  };
//  async findUserByToken(token: string) {
  
//   return await this.userModel
//     .findOne({ refreshToken: token })
//     .exec(); // ✅ KHÔNG populate role ở đây
// }
  async findByIdWithPassword(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException('ID không hợp lệ');
    }

    return this.userModel.findById(id); // giữ lại cả password
  }

  async updatePassword(id: string, newPassword: string) {
    const hashedPassword = await this.gethashpassword(newPassword);

    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        { _id: id },
        { password: hashedPassword },
        { new: true, runValidators: true }, // đảm bảo validate nếu cần
      )
      .exec(); // thêm exec() để rõ ràng và dễ debug

    if (!updatedUser) {
      throw new NotFoundException(
        'Không tìm thấy người dùng để cập nhật mật khẩu',
      );
    }

    return updatedUser;
  }

  async updateProfile(id: string, updateUserDto:UpdateUserDto){
  if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID người dùng không hợp lệ');
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password'); // Luôn loại bỏ password khỏi kết quả trả về

    if (!updatedUser) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    return updatedUser;
  }
 

 async findAllForExport() {
// 1. Lấy dữ liệu gốc với populate
 type PopulatedUser = Omit<User, 'role' | 'company'> & {
  role?: { name: string };
  company?: { name: string };
  };
    const usersFromDb = await this.userModel
      .find({})
      .select('-password')
      .populate('role', 'name')
      .populate('company', 'name')
      .lean<PopulatedUser[]>(); // <= Thêm generic type ở đây
  
    // 2. Biến đổi dữ liệu thành dạng phẳng
    const transformedUsers = usersFromDb.map(user => ({
      name: user.name,
      email: user.email,
      address: user.address,
      gender: user.gender,
      age: user.age,
      role:user.role?user.role?.name:'',
      company: user.company ? user.company.name : '',
    }));
    
    // 3. Trả về dữ liệu đã được làm phẳng
    return transformedUsers;
  }
async importUsers(dtos: ImportUserDto[]) {
    const createdUsers = [];
    const errors = [];

    // Mật khẩu mặc định nếu file Excel không cung cấp
    const defaultPassword = 'DefaultPassword123!';

    for (const [index, userDto] of dtos.entries()) {
      try {
        // 1. Kiểm tra email đã tồn tại chưa
        const existingUser = await this.userModel.findOne({ email: userDto.email });
        if (existingUser) {
          errors.push({
            row: index + 2, // +2 để khớp với số dòng trong file Excel
            email: userDto.email,
            message: `Email đã tồn tại.`,
          });
          continue; // Bỏ qua và đi đến user tiếp theo
        }

        // 2. Xác định mật khẩu để hash: ưu tiên mật khẩu từ file, nếu không có thì dùng mặc định
        const passwordToHash = userDto.password || defaultPassword;
        const hashedPassword = await this.gethashpassword(passwordToHash);

        // 3. Tạo user mới
        const newUser = {
          ...userDto, // Lấy tất cả dữ liệu từ DTO (name, email, address...)
          password: hashedPassword,
        };

        const created = await this.userModel.create(newUser);
        console.log('fdssfdk',created);
        createdUsers.push(created);

      } catch (error) {
        errors.push({
          row: index + 2,
          email: userDto.email,
          message: error.message,
        });
      }
    }

    return {
      createdCount: createdUsers.length,
      errors,
      errorCount: errors.length,
    };
  }

}





