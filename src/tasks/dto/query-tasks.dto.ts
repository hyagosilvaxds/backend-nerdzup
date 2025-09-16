import { IsString, IsOptional, IsEnum, IsInt, Min, Max, IsDateString, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TaskStatus, TaskPriority } from '@prisma/client';

export class QueryTasksDto {
  @IsString()
  @IsOptional()
  clientId?: string;

  @IsString()
  @IsOptional()
  serviceId?: string;

  @IsString()
  @IsOptional()
  campaignId?: string;

  @IsString()
  @IsOptional()
  employeeId?: string; // Filtrar tarefas atribuídas a um funcionário específico

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsString()
  @IsOptional()
  search?: string; // Buscar por título ou descrição

  @IsDateString()
  @IsOptional()
  dueDateFrom?: string;

  @IsDateString()
  @IsOptional()
  dueDateTo?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  overdue?: boolean; // Filtrar tarefas atrasadas

  @IsString()
  @IsOptional()
  sortBy?: string = 'createdAt'; // createdAt, dueDate, priority, progress, title

  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';

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

export class UpdateTaskStatusDto {
  @IsEnum(TaskStatus)
  status: TaskStatus;
}

export class UpdateTaskProgressDto {
  @IsInt()
  @Min(0)
  @Max(100)
  progress: number;
}

export class AssignTaskDto {
  @IsString({ each: true })
  employeeIds: string[];
}

export class CreateTaskCommentDto {
  @IsString()
  content: string;
}

export class CreateTaskFileDto {
  @IsString()
  fileName: string;

  @IsString()
  fileUrl: string;

  @IsString()
  @IsOptional()
  description?: string;
}