import { IsString, IsOptional, IsUrl } from 'class-validator';

export class UpdateProfilePhotoDto {
  @IsString()
  @IsUrl()
  @IsOptional()
  profilePhoto?: string;
}