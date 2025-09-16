import { IsOptional, IsString, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryCampaignsDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value) || 1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value) || 20)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  search?: string; // Busca por nome, descrição

  @IsOptional()
  @IsString()
  status?: string; // Status da campanha

  @IsOptional()
  @IsString()
  clientId?: string; // Filtrar por cliente específico

  @IsOptional()
  @IsEnum(['name', 'startDate', 'endDate', 'createdAt'])
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: string = 'desc';
}