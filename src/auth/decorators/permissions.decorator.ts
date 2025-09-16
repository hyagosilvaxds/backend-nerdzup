import { SetMetadata } from '@nestjs/common';
import { Permission } from '@prisma/client';

export const Permissions = (...permissions: Permission[]) => SetMetadata('permissions', permissions);