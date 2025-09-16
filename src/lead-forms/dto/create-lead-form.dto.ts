import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLeadFormInputDto {
  @IsString()
  @IsNotEmpty()
  inputKey: string;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsNotEmpty()
  inputType: 'TEXT' | 'EMAIL' | 'NUMBER' | 'FILE' | 'SELECT_2' | 'SELECT_3' | 'SELECT_4' | 'SELECT_5' | 'SELECT_6' | 'TEXTAREA' | 'PHONE' | 'DATE';

  @IsString()
  @IsOptional()
  placeholder?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  options?: string[];

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean = true;

  @IsString()
  @IsOptional()
  validationRegex?: string;

  @IsString()
  @IsOptional()
  helpText?: string;

  @IsOptional()
  order?: number = 0;
}

export class CreateLeadFormStepDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isRequired?: boolean = true;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLeadFormInputDto)
  inputs: CreateLeadFormInputDto[];
}

export class CreateLeadFormDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  initialText: string;

  @IsBoolean()
  @IsOptional()
  allowMultipleSubmissions?: boolean = false;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLeadFormStepDto)
  steps: CreateLeadFormStepDto[];
}