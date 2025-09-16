import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsDateString } from 'class-validator';
import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @IsDateString()
  @IsOptional()
  completedAt?: string;
}