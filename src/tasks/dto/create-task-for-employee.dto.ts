import { IsString, IsNotEmpty, IsOptional, IsDateString, IsEnum, IsUUID, IsArray, ArrayMinSize } from 'class-validator';
import { TaskStatus, TaskPriority } from '@prisma/client';

export class CreateTaskForEmployeeDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus = TaskStatus.BACKLOG;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority = TaskPriority.MEDIA;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsUUID()
  @IsNotEmpty()
  assignedToEmployeeId: string;

  @IsUUID()
  @IsOptional()
  clientId?: string; // ID do cliente se relevante

  @IsUUID()
  @IsOptional()
  serviceId?: string; // ID do serviço se relevante

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsOptional()
  estimatedHours?: number;
}