// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Module } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { PermissionsService } from './permissions.service';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { PermissionsController } from './permissions.controller';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Permission, PermissionSchema } from './schemas/permission.Schema';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { MongooseModule } from '@nestjs/mongoose';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Role, RoleSchema } from 'src/roles/schemas/role.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Permission.name, schema: PermissionSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
  ],

  controllers: [PermissionsController],
  providers: [PermissionsService],
})
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class PermissionsModule {}
