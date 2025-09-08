import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { User } from '../auth/decorators/user.decorator';
import { Role, Permission } from '@prisma/client';

@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @Roles(Role.ADMIN)
  @Permissions(Permission.WRITE_EMPLOYEES)
  create(@Body() createEmployeeDto: CreateEmployeeDto, @User('id') userId: string) {
    return this.employeesService.create(createEmployeeDto, userId);
  }

  @Get()
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @Permissions(Permission.READ_EMPLOYEES)
  findAll() {
    return this.employeesService.findAll();
  }

  @Get('permissions')
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  getPermissions() {
    return this.employeesService.getPermissions();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @Permissions(Permission.READ_EMPLOYEES)
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @Permissions(Permission.WRITE_EMPLOYEES)
  update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @Permissions(Permission.DELETE_EMPLOYEES)
  remove(@Param('id') id: string) {
    return this.employeesService.remove(id);
  }

  @Post(':id/permissions')
  @Roles(Role.ADMIN)
  @Permissions(Permission.MANAGE_PERMISSIONS)
  assignPermissions(
    @Param('id') id: string,
    @Body() assignPermissionsDto: AssignPermissionsDto,
    @User('id') userId: string,
  ) {
    return this.employeesService.assignPermissions(id, assignPermissionsDto, userId);
  }

  @Delete(':id/permissions')
  @Roles(Role.ADMIN)
  @Permissions(Permission.MANAGE_PERMISSIONS)
  removePermission(@Param('id') id: string, @Query('permission') permission: Permission) {
    return this.employeesService.removePermission(id, permission);
  }
}