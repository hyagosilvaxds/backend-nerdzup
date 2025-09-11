import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryClientsDto {
  @IsString()
  @IsOptional()
  search?: string; // Buscar por nome, email, empresa, etc.

  @IsString()
  @IsOptional()
  sortBy?: string = 'createdAt'; // createdAt, fullName, companyName, totalSpent

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
