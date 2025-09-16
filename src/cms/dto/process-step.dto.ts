import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateProcessStepDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  imageUrl: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;
}

export class UpdateProcessStepDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;
}