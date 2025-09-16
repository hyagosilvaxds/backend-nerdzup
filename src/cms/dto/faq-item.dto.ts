import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateFaqItemDto {
  @IsString()
  question: string;

  @IsString()
  answer: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;
}

export class UpdateFaqItemDto {
  @IsOptional()
  @IsString()
  question?: string;

  @IsOptional()
  @IsString()
  answer?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;
}