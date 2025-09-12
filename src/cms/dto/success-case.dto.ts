import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateSuccessCaseDto {
  @IsString()
  personName: string;

  @IsString()
  personRole: string;

  @IsString()
  personPhotoUrl: string;

  @IsString()
  caseImageUrl: string;

  @IsString()
  caseText: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;
}

export class UpdateSuccessCaseDto {
  @IsOptional()
  @IsString()
  personName?: string;

  @IsOptional()
  @IsString()
  personRole?: string;

  @IsOptional()
  @IsString()
  personPhotoUrl?: string;

  @IsOptional()
  @IsString()
  caseImageUrl?: string;

  @IsOptional()
  @IsString()
  caseText?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;
}