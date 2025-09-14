import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const userRole = user.role;

    // Verificar se o usuário tem o role exato requerido
    if (requiredRoles.some((role) => userRole === role)) {
      return true;
    }

    // Tratar EMPLOYEE com as mesmas permissões que ADMIN
    // Se ADMIN é requerido e o usuário é EMPLOYEE, permitir acesso
    if (userRole === Role.EMPLOYEE && requiredRoles.includes(Role.ADMIN)) {
      return true;
    }

    // Se EMPLOYEE é requerido e o usuário é ADMIN, permitir acesso também
    if (userRole === Role.ADMIN && requiredRoles.includes(Role.EMPLOYEE)) {
      return true;
    }

    return false;
  }
}