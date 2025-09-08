import { IsString, IsUrl, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateClientLogoDto {
  @IsUrl()
  imageUrl: string;

  @IsOptional()
  @IsString()
  altText?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;
}

export class UpdateClientLogoDto {
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  altText?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;
}