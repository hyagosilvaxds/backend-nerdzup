import { IsString, IsOptional, IsUUID, IsDateString, IsEnum, IsArray } from 'class-validator';
import { TaskPriority } from '@prisma/client';

export class CreateServiceRequestDto {
  @IsUUID()
  serviceId: string;

  @IsString()
  projectName: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsDateString()
  desiredDeadline?: string;

  @IsOptional()
  @IsString()
  targetAudience?: string;

  @IsOptional()
  @IsString()
  projectObjectives?: string;

  @IsOptional()
  @IsString()
  brandGuidelines?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredColors?: string[];

  @IsOptional()
  @IsString()
  technicalRequirements?: string;

  @IsOptional()
  @IsString()
  references?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documentUrls?: string[];

  @IsOptional()
  @IsString()
  observations?: string;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority = TaskPriority.MEDIA;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}