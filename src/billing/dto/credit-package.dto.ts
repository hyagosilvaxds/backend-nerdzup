import { IsString, IsOptional, IsInt, Min, IsDecimal, IsBoolean, IsNumber } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateCreditPackageDto {
  @IsString()
  name: string;

  @IsString()
  displayName: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  credits: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => value != null ? parseFloat(value) : undefined)
  price: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  bonusCredits?: number = 0;

  @IsBoolean()
  @IsOptional()
  isPopular?: boolean = false;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  order?: number = 0;
}

export class UpdateCreditPackageDto {
  @IsString()
  @IsOptional()
  displayName?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  credits?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => value != null ? parseFloat(value) : undefined)
  @IsOptional()
  price?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  bonusCredits?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isPopular?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  order?: number;
}