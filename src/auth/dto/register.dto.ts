import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional, IsUrl } from 'class-validator';
import { Role, PersonType, CompanySize } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role = Role.CLIENT;

  @IsString()
  @IsUrl()
  @IsOptional()
  profilePhoto?: string;
}

export class RegisterClientDto extends RegisterDto {
  // Personal/Business Information (all optional for flexible enrollment)
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsEnum(PersonType)
  @IsOptional()
  personType?: PersonType;

  @IsString()
  @IsOptional()
  taxDocument?: string; // CPF ou CNPJ

  @IsString()
  @IsOptional()
  position?: string; // Cargo

  // Company Information (for BUSINESS type)
  @IsString()
  @IsOptional()
  companyName?: string; // Razão social

  @IsString()
  @IsOptional()
  tradeName?: string; // Nome fantasia

  @IsString()
  @IsOptional()
  sector?: string; // Setor de atuação

  @IsEnum(CompanySize)
  @IsOptional()
  companySize?: CompanySize;

  @IsUrl()
  @IsOptional()
  website?: string;

  // Contact Information
  @IsString()
  @IsOptional()
  phone?: string;

  // Address Information
  @IsString()
  @IsOptional()
  street?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  zipCode?: string;

  @IsString()
  @IsOptional()
  country?: string;
}

export class RegisterEmployeeDto extends RegisterDto {
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
}