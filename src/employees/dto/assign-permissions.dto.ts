import { IsEnum, IsArray } from 'class-validator';
import { Permission } from '@prisma/client';

export class AssignPermissionsDto {
  @IsArray()
  @IsEnum(Permission, { each: true })
  permissions: Permission[];
}