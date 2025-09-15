import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission } from '@prisma/client';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const request = context.switchToHttp().getRequest();
    
    // Admin has all permissions
    if (user.role === 'ADMIN') {
      return true;
    }

    // Special case: Allow employees to update task status if they're assigned to it
    // This is checked in the service layer, not here
    if (user.role === 'EMPLOYEE' && 
        request.route?.path?.includes('/tasks/') && 
        request.route?.path?.includes('/status') &&
        request.method === 'PATCH') {
      return true; // Allow the request to proceed, authorization checked in service
    }

    // Check if user is employee and has required permissions
    if (user.role === 'EMPLOYEE' && user.employee) {
      const userPermissions = user.employee.permissions.map(p => p.permission);
      return requiredPermissions.some(permission => userPermissions.includes(permission));
    }

    return false;
  }
}