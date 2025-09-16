import { IsString, IsOptional, IsInt, Min, IsDecimal, IsBoolean, IsArray, IsEnum, ValidateIf, IsNumber } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  VALUE = 'VALUE'
}

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
  @Type(() => Number)
  monthlyCredits: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => value != null ? parseFloat(value) : undefined)
  monthlyPrice: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => value != null ? parseFloat(value) : undefined)
  @IsOptional()
  annualPrice?: number;

  @IsEnum(DiscountType)
  @IsOptional()
  discountType?: DiscountType;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => value != null ? parseFloat(value) : undefined)
  @IsOptional()
  @ValidateIf(o => o.discountType !== undefined && o.discountType !== null)
  discountValue?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  benefits?: string[] = [];

  @IsBoolean()
  @IsOptional()
  isPopular?: boolean = false;

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
  @Type(() => Number)
  monthlyCredits?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => value != null ? parseFloat(value) : undefined)
  @IsOptional()
  monthlyPrice?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => value != null ? parseFloat(value) : undefined)
  @IsOptional()
  annualPrice?: number;

  @IsEnum(DiscountType)
  @IsOptional()
  discountType?: DiscountType;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => value != null ? parseFloat(value) : undefined)
  @IsOptional()
  @ValidateIf(o => o.discountType !== undefined && o.discountType !== null)
  discountValue?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  benefits?: string[];

  @IsBoolean()
  @IsOptional()
  isPopular?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  order?: number;
}