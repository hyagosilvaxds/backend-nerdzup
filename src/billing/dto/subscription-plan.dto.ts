import { IsString, IsOptional, IsInt, Min, IsDecimal, IsBoolean, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateSubscriptionPlanDto {
  @IsString()
  name: string;

  @IsString()
  displayName: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(0)
  monthlyCredits: number;

  @IsDecimal()
  @Transform(({ value }) => parseFloat(value))
  monthlyPrice: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[] = [];

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  order?: number = 0;
}

export class UpdateSubscriptionPlanDto {
  @IsString()
  @IsOptional()
  displayName?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  monthlyCredits?: number;

  @IsDecimal()
  @Transform(({ value }) => parseFloat(value))
  @IsOptional()
  monthlyPrice?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[];

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  order?: number;
}