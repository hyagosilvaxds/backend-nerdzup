import { IsString, MinLength, IsNotEmpty } from 'class-validator';

export class ChangeEmployeePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @MinLength(6)
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}