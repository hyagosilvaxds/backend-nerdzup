import { IsString, IsOptional, IsInt, Min, IsDecimal, IsBoolean } from 'class-validator';
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
  credits: number;

  @IsDecimal()
  @Transform(({ value }) => parseFloat(value))
  price: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  bonusCredits?: number = 0;

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
  credits?: number;

  @IsDecimal()
  @Transform(({ value }) => parseFloat(value))
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

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  order?: number;
}