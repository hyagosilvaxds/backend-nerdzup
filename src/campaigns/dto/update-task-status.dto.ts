import { IsEnum, IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { TaskStatus } from '@prisma/client';

export class UpdateTaskStatusDto {
  @IsEnum(TaskStatus)
  status: TaskStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  spentHours?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}