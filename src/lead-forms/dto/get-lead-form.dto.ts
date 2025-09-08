import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class GetLeadFormQueryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  activeOnly?: boolean = true;
}

export class GetSubmissionsQueryDto {
  @IsString()
  @IsOptional()
  formId?: string;

  @IsBoolean()
  @IsOptional()
  completedOnly?: boolean;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  dateFrom?: string;

  @IsString()
  @IsOptional()
  dateTo?: string;
}