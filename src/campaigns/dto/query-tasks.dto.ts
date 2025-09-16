import { IsOptional, IsString, IsBoolean, IsEnum, IsDateString } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { TaskStatus } from '@prisma/client';

export class QueryTasksDto {
  @IsOptional()
  @IsString()
  campaignId?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  includeArchived?: boolean = false;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}