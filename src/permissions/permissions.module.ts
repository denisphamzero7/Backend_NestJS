import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';

import { Permission, PermissionSchema } from './schemas/permission.Schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forFeature([{ name: Permission.name, schema: PermissionSchema }]),],

  controllers: [PermissionsController],
  providers: [PermissionsService]
})
export class PermissionsModule {}
