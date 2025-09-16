import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, IsEnum, IsArray, IsNumber, Min, Max } from 'class-validator';
import { ServiceDifficulty } from '@prisma/client';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  shortDescription?: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsInt()
  @Min(0)
  credits: number;

  @IsInt()
  @Min(1)
  estimatedDays: number;

  @IsEnum(ServiceDifficulty)
  difficulty: ServiceDifficulty;

  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  rating?: number = 0.0;

  @IsInt()
  @Min(0)
  @IsOptional()
  ratingCount?: number = 0;

  @IsString()
  @IsOptional()
  iconUrl?: string;

  @IsArray()
  @IsString({ each: true })
  features: string[];

  @IsArray()
  @IsString({ each: true })
  benefits: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean = false;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[] = [];

  @IsInt()
  @IsOptional()
  order?: number = 0;
}