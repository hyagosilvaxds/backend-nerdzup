import { IsArray, IsString, IsOptional, IsUUID } from 'class-validator';

export class AssignEmployeesToRequestDto {
  @IsArray()
  @IsUUID(undefined, { each: true })
  employeeIds: string[]; // Array de IDs dos employees

  @IsOptional()
  @IsString()
  notes?: string; // Observações da atribuição
}