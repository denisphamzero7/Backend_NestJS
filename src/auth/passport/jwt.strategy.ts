import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUser } from 'src/users/user.interface';
import { RolesService } from 'src/roles/roles.service';
import { Document } from 'mongoose'; // Chỉ cần import Document từ mongoose

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private roleService: RolesService,
  ) {
    super({
      // Extracts the JWT from the Authorization header (Bearer token)
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  // The 'payload' is the decoded content of the JWT token
  async validate(payload: IUser) {
    // Destructure properties we need from the token payload
    const { _id, name, email, role, gender, phone, address } = payload;

    // We will build a clean array of permission objects here
    let permissions = [];
    let userRole = role; // Start with the role from the payload

    // 1. Check if a role exists in the payload
    if (userRole) {
      // Lấy role ID từ payload
      const roleId = (userRole as unknown as { _id: string })._id;

      // 2. Fetch the full Role document from the database
      // LƯU Ý QUAN TRỌNG: roleService.findOne() PHẢI trả về Mongoose Document (không có .lean())
      const roleDocument = await this.roleService.findOne(roleId);
      
      // Kiểm tra xem Document có tồn tại và có phương thức populate (xác nhận nó là Mongoose Document)
      // Ép kiểu sang 'any' để truy cập phương thức populate nếu Typescript không nhận ra
      if (roleDocument && (roleDocument as any).populate) {
        try {
          // 3. Populate và thực hiện query: lấy thông tin chi tiết của permissions
          const populatedRole = await (roleDocument as any).populate({
            path: 'permissions',
            // Chỉ chọn các trường cần thiết
            select: 'name method apiPath module', 
          });

          // 4. Crucially, convert the populated Mongoose document into a plain JavaScript object
          // Phương thức .toObject() sẽ tự động chuyển đổi mảng permissions đã populate thành plain objects
          const populatedRoleObject = populatedRole.toObject();

          if (populatedRoleObject.permissions) {
            // Lấy mảng permissions đã được populate và làm sạch
            permissions = populatedRoleObject.permissions;
          }
          
          // 5. Update the userRole object to be the cleaned, populated version
          userRole = populatedRoleObject;

        } catch (error) {
          // Log lỗi nếu populate thất bại (thường do lỗi Mongoose hoặc Schema)
          console.error(`Error during Mongoose population in JwtStrategy: ${error.message}`);
        }
      } else {
         // Trường hợp roleDocument là null hoặc là object LEAN (không có .populate)
         console.error(`Role not found or is a LEAN object (missing .populate() method). Please verify RolesService.findOne(id) does not use .lean().`);
      }
    }
    
    // DEBUG: Log the final permissions array to confirm data is present before returning
    console.log(`[DEBUG JWT] Final Permissions Array: ${JSON.stringify(permissions, null, 2)}`);

    // Return the final user object to be attached to the Request (req.user)
    return {
      _id,
      name,
      email,
      role: userRole,
      permissions,
      gender,
      phone,
      address,
    };
  }
}