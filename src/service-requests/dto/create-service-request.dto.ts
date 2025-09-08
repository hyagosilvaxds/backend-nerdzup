import { IsString, IsOptional, IsUUID, IsDateString, IsEnum } from 'class-validator';
import { TaskPriority } from '@prisma/client';

export class CreateServiceRequestDto {
  @IsUUID()
  serviceId: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority = TaskPriority.MEDIA;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}