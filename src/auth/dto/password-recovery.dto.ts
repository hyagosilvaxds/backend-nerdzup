import { IsEmail, IsString, MinLength } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class RequestLoginCodeDto {
  @IsEmail()
  email: string;
}

export class VerifyLoginCodeDto {
  @IsEmail()
  email: string;

  @IsString()
  code: string;
}