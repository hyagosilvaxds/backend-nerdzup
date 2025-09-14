import { IsNumber, IsString, IsOptional } from 'class-validator';

export class AdjustCreditsDto {
  @IsNumber()
  credits: number;

  @IsString()
  @IsOptional()
  reason?: string;
}