import { IsString, IsNotEmpty, IsOptional, IsEmail, IsEnum, IsUrl } from 'class-validator';
import { PersonType, CompanySize } from '@prisma/client';

export class CreateClientDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

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