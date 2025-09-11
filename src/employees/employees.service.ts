import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangeEmployeePasswordDto } from './dto/change-employee-password.dto';
import { Role, Permission } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async create(createEmployeeDto: CreateEmployeeDto, createdById: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createEmployeeDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createEmployeeDto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: createEmployeeDto.email,
        password: hashedPassword,
        role: Role.EMPLOYEE,
        employee: {
          create: {
            name: createEmployeeDto.name,
            position: createEmployeeDto.position,
            department: createEmployeeDto.department,
            phone: createEmployeeDto.phone,
            hireDate: createEmployeeDto.hireDate ? new Date(createEmployeeDto.hireDate) : new Date(),
            salary: createEmployeeDto.salary,
            isActive: createEmployeeDto.isActive ?? true,
          },
        },
      },
      include: {
        employee: {
          include: {
            permissions: true,
          },
        },
      },
    });

    // Assign initial permissions if provided
    if (createEmployeeDto.permissions && createEmployeeDto.permissions.length > 0 && user.employee) {
      const permissionsData = createEmployeeDto.permissions.map(permission => ({
        employeeId: user.employee!.id,
        permission,
        grantedBy: createdById,
      }));

      await this.prisma.employeePermissions.createMany({
        data: permissionsData,
      });

      // Reload user with permissions
      const updatedUser = await this.prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          profilePhoto: true,
          createdAt: true,
          updatedAt: true,
          employee: {
            include: {
              permissions: true,
            },
          },
        },
      });

      return updatedUser;
    }

    const { password, ...result } = user;
    return result;
  }

  async findAll() {
    return this.prisma.employee.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
            profilePhoto: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        permissions: true,
      },
    });
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
            profilePhoto: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        permissions: true,
        campaigns: true,
        taskAssignments: {
          include: {
            task: {
              select: {
                id: true,
                title: true,
                status: true,
                progress: true,
                dueDate: true,
              },
            },
          },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const updateData: any = {};
    if (updateEmployeeDto.name !== undefined) updateData.name = updateEmployeeDto.name;
    if (updateEmployeeDto.position !== undefined) updateData.position = updateEmployeeDto.position;
    if (updateEmployeeDto.department !== undefined) updateData.department = updateEmployeeDto.department;
    if (updateEmployeeDto.phone !== undefined) updateData.phone = updateEmployeeDto.phone;
    if (updateEmployeeDto.hireDate !== undefined) updateData.hireDate = new Date(updateEmployeeDto.hireDate);
    if (updateEmployeeDto.salary !== undefined) updateData.salary = updateEmployeeDto.salary;
    if (updateEmployeeDto.isActive !== undefined) updateData.isActive = updateEmployeeDto.isActive;

    return this.prisma.employee.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
            profilePhoto: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        permissions: true,
      },
    });
  }

  async remove(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Delete the user (cascade will delete employee)
    await this.prisma.user.delete({
      where: { id: employee.userId },
    });

    return { 
      message: 'Employee deleted successfully',
      deletedEmployeeId: id,
      deletedUserId: employee.userId,
    };
  }

  async assignPermissions(id: string, assignPermissionsDto: AssignPermissionsDto, grantedBy: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Remove existing permissions
    await this.prisma.employeePermissions.deleteMany({
      where: { employeeId: id },
    });

    // Add new permissions
    const permissionsData = assignPermissionsDto.permissions.map(permission => ({
      employeeId: id,
      permission,
      grantedBy,
    }));

    const createdPermissions = await Promise.all(
      permissionsData.map(async (data) => {
        return this.prisma.employeePermissions.create({ data });
      })
    );

    return {
      message: 'Permissions assigned successfully',
      employeeId: id,
      assignedPermissions: createdPermissions,
      assignedBy: grantedBy,
      assignedAt: new Date(),
    };
  }

  async removePermission(id: string, permission: Permission) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const deletedCount = await this.prisma.employeePermissions.deleteMany({
      where: {
        employeeId: id,
        permission,
      },
    });

    if (deletedCount.count === 0) {
      throw new NotFoundException('Permission not found for this employee');
    }

    return {
      message: 'Permission removed successfully',
      employeeId: id,
      removedPermission: permission,
      removedAt: new Date(),
    };
  }

  async getPermissions() {
    return {
      permissions: Object.values(Permission),
    };
  }

  async resetPassword(employeeId: string, resetPasswordDto: ResetPasswordDto, adminId: string) {
    const { newPassword } = resetPasswordDto;

    // Verificar se o funcionário existe
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: { user: true },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Atualizar a senha do usuário
    await this.prisma.user.update({
      where: { id: employee.userId },
      data: { password: hashedPassword },
    });

    return {
      message: 'Password reset successfully',
      employeeId: employeeId,
      userId: employee.userId,
      resetBy: adminId,
      resetAt: new Date(),
    };
  }

  async changeEmployeePassword(employeeId: string, changePasswordDto: ChangeEmployeePasswordDto) {
    if (!employeeId) {
      throw new BadRequestException('Employee profile not found');
    }

    const { currentPassword, newPassword, confirmPassword } = changePasswordDto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('New password and confirmation do not match');
    }

    // Buscar funcionário e usuário
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: { user: true },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Verificar senha atual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, employee.user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash da nova senha
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Atualizar senha
    await this.prisma.user.update({
      where: { id: employee.userId },
      data: { password: hashedNewPassword },
    });

    return {
      message: 'Password changed successfully',
      employeeId: employeeId,
      changedAt: new Date(),
    };
  }

  async updateProfilePhoto(employeeId: string, file: Express.Multer.File) {
    // Verificar se o funcionário existe
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: { user: true },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Gerar URL da foto
    const photoUrl = `/uploads/profile-photos/${file.filename}`;

    // Atualizar a foto de perfil do usuário
    const updatedUser = await this.prisma.user.update({
      where: { id: employee.userId },
      data: { profilePhoto: photoUrl },
      select: {
        id: true,
        email: true,
        profilePhoto: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Profile photo updated successfully',
      profilePhoto: updatedUser.profilePhoto,
      fileName: file.filename,
      originalName: file.originalname,
      uploadedAt: new Date(),
    };
  }
}