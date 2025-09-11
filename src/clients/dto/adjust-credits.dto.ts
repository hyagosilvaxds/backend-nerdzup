import { IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class AdjustCreditsDto {
  @IsNumber()
  @Min(1)
  credits: number;

  @IsString()
  @IsOptional()
  reason?: string;
}