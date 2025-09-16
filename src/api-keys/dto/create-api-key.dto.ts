import { IsString, IsEnum, IsOptional, IsBoolean, MinLength } from 'class-validator';
import { ApiKeyProvider } from '@prisma/client';

export class CreateApiKeyDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsEnum(ApiKeyProvider)
  provider: ApiKeyProvider;

  @IsString()
  @MinLength(1)
  keyValue: string;

  @IsOptional()
  @IsString()
  environment?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}