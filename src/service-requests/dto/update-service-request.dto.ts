import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { TaskPriority } from '@prisma/client';

export class UpdateServiceRequestDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}