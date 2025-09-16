import { IsArray, IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { TaskPriority } from '@prisma/client';

export class AssignServiceRequestDto {
  @IsArray()
  @IsString({ each: true })
  employeeIds: string[]; // Array de IDs dos funcionários

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority; // Prioridade da tarefa

  @IsOptional()
  @IsDateString()
  dueDate?: string; // Prazo para conclusão

  @IsOptional()
  @IsString()
  notes?: string; // Observações da atribuição
}