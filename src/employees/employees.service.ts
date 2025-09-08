import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
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
            createdAt: true,
            updatedAt: true,
          },
        },
        permissions: true,
        campaigns: true,
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

    return { message: 'Employee deleted successfully' };
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

    await this.prisma.employeePermissions.createMany({
      data: permissionsData,
    });

    return this.findOne(id);
  }

  async removePermission(id: string, permission: Permission) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    await this.prisma.employeePermissions.deleteMany({
      where: {
        employeeId: id,
        permission,
      },
    });

    return this.findOne(id);
  }

  async getPermissions() {
    return Object.values(Permission);
  }
}