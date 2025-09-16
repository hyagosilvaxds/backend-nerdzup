import { IsString, IsNotEmpty, IsInt, IsBoolean, IsEmail, IsOptional, Min, Max } from 'class-validator';

export class CreateSmtpConfigurationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  host: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  port: number;

  @IsBoolean()
  @IsOptional()
  secure?: boolean = true;

  @IsEmail()
  user: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  fromName?: string = 'Nerdzup Marketing';

  @IsEmail()
  fromEmail: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = false;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean = false;
}