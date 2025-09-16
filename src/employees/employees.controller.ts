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
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { UpdateEmployeeProfileDto } from './dto/update-employee-profile.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangeEmployeePasswordDto } from './dto/change-employee-password.dto';
import { FileInterceptor } from '@nestjs/platform-express';
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

  @Patch(':id/reset-password')
  @Roles(Role.ADMIN)
  @Permissions(Permission.WRITE_EMPLOYEES)
  @HttpCode(HttpStatus.OK)
  resetPassword(@Param('id') id: string, @Body() resetPasswordDto: ResetPasswordDto, @User('id') adminId: string) {
    return this.employeesService.resetPassword(id, resetPasswordDto, adminId);
  }

  @Post('change-password')
  @Roles(Role.EMPLOYEE)
  @HttpCode(HttpStatus.OK)
  changePassword(@Body() changePasswordDto: ChangeEmployeePasswordDto, @User() user: any) {
    return this.employeesService.changeEmployeePassword(user.employee?.id, changePasswordDto);
  }

  @Patch('profile')
  @Roles(Role.EMPLOYEE)
  @HttpCode(HttpStatus.OK)
  updateMyProfile(@Body() updateProfileDto: UpdateEmployeeProfileDto, @User() user: any) {
    if (!user.employee?.id) {
      throw new BadRequestException('Employee profile not found');
    }
    return this.employeesService.updateEmployeeProfile(user.employee.id, updateProfileDto);
  }

  @Post(':id/profile-photo')
  @Roles(Role.ADMIN, Role.EMPLOYEE)
  @UseInterceptors(FileInterceptor('photo', {
    storage: require('multer').diskStorage({
      destination: './uploads/profile-photos',
      filename: (req, file, cb) => {
        const uniqueSuffix = require('uuid').v4();
        const fileExt = require('path').extname(file.originalname);
        cb(null, `${uniqueSuffix}${fileExt}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Apenas arquivos de imagem são permitidos'), false);
      }
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  }))
  @HttpCode(HttpStatus.OK)
  uploadProfilePhoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @User() user: any,
  ) {
    // Verificar se o usuário pode alterar a foto
    if (user.role === Role.EMPLOYEE && user.employee?.id !== id) {
      throw new BadRequestException('Você só pode alterar sua própria foto de perfil');
    }
    
    if (!file) {
      throw new BadRequestException('Nenhuma imagem foi enviada');
    }

    return this.employeesService.updateProfilePhoto(id, file);
  }
}