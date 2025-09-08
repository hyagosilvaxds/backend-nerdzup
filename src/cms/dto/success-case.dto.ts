import { IsString, IsUrl, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateSuccessCaseDto {
  @IsString()
  personName: string;

  @IsString()
  personRole: string;

  @IsUrl()
  personPhotoUrl: string;

  @IsUrl()
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
  @IsUrl()
  personPhotoUrl?: string;

  @IsOptional()
  @IsUrl()
  caseImageUrl?: string;

  @IsOptional()
  @IsString()
  caseText?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;
}