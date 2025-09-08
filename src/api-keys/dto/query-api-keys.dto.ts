import { IsOptional, IsEnum, IsBoolean, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiKeyProvider } from '@prisma/client';

export class QueryApiKeysDto {
  @IsOptional()
  @IsEnum(ApiKeyProvider)
  provider?: ApiKeyProvider;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @IsOptional()
  @IsString()
  environment?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number;
}