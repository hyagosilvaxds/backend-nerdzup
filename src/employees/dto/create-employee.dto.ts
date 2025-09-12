import { IsString, IsNotEmpty, IsOptional, IsDecimal, IsBoolean, IsDateString, IsArray, IsEnum } from 'class-validator';
import { Permission, Role } from '@prisma/client';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  position: string;

  @IsString()
  @IsOptional()
  department?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsDateString()
  @IsOptional()
  hireDate?: string;

  @IsDecimal()
  @IsOptional()
  salary?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @IsEnum(Role)
  @IsOptional()
  role?: Role = Role.EMPLOYEE; // Default to EMPLOYEE, can be ADMIN or EMPLOYEE

  @IsArray()
  @IsEnum(Permission, { each: true })
  @IsOptional()
  permissions?: Permission[];
}