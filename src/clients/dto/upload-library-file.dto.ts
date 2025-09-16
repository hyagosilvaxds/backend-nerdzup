import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ClientFileType } from '@prisma/client';

export class UploadLibraryFileDto {
  @IsEnum(ClientFileType)
  @IsOptional()
  fileType?: ClientFileType = ClientFileType.OTHER;

  @IsString()
  @IsOptional()
  description?: string;
}