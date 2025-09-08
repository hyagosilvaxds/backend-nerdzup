import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { TaskPriority } from '@prisma/client';

export class ApproveServiceRequestDto {
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

export class RejectServiceRequestDto {
  @IsString()
  rejectionReason: string;

  @IsOptional()
  @IsString()
  notes?: string;
}