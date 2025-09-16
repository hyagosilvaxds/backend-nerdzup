import { IsString, IsEnum, IsOptional, IsDateString, IsNotEmpty, IsArray, IsNumber } from 'class-validator';
import { TaskStatus, TaskPriority } from '@prisma/client';

export class CreateCampaignTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsNumber()
  estimatedHours?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assigneeIds?: string[]; // IDs dos employees que devem ser atribuídos à task
}