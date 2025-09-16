import { IsString, IsOptional, IsBoolean, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ServiceDifficulty } from '@prisma/client';

export class QueryServiceCategoriesDto {
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  activeOnly?: boolean = true;

  @IsString()
  @IsOptional()
  search?: string;
}

export class QueryServicesDto {
  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  categoryName?: string;

  @IsEnum(ServiceDifficulty)
  @IsOptional()
  difficulty?: ServiceDifficulty;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  minCredits?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  maxCredits?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  minDays?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  maxDays?: number;

  @IsInt()
  @Min(0)
  @Max(5)
  @IsOptional()
  @Type(() => Number)
  minRating?: number;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  activeOnly?: boolean = true;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  featuredOnly?: boolean;

  @IsString()
  @IsOptional()
  tags?: string; // Comma separated tags

  @IsString()
  @IsOptional()
  sortBy?: string = 'order'; // order, credits, rating, estimatedDays, createdAt

  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'asc';

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}

export class UpdateServiceRatingDto {
  @IsInt()
  @Min(0)
  @Max(5)
  rating: number;
}