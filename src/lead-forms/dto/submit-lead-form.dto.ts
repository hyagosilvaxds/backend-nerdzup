import { IsString, IsOptional, IsObject, IsEmail, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class LeadFormResponseDto {
  @IsString()
  @IsNotEmpty()
  stepId: string;

  @IsString()
  @IsNotEmpty()
  inputKey: string;

  @IsString()
  @IsNotEmpty()
  value: string;

  @IsString()
  @IsOptional()
  fileUrl?: string;
}

export class SubmitLeadFormDto {
  @IsString()
  @IsNotEmpty()
  formId: string;

  @IsString()
  @IsOptional()
  submissionId?: string; // Para continuar uma submissão existente

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  ipAddress?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LeadFormResponseDto)
  responses: LeadFormResponseDto[];
}

export class StartLeadFormDto {
  @IsString()
  @IsNotEmpty()
  formId: string;

  @IsString()
  @IsOptional()
  ipAddress?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;
}

export class CompleteLeadFormDto {
  @IsString()
  @IsNotEmpty()
  submissionId: string;
}