import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';

export class UpdateEmployeeProfileDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}