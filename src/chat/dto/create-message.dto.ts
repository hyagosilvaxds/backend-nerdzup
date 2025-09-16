import { IsString, IsOptional, IsEnum, IsUUID, IsInt, Min } from 'class-validator';
import { MessageType } from '@prisma/client';

export class CreateMessageDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsEnum(MessageType)
  messageType: MessageType;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  fileSize?: number;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsUUID()
  replyToId?: string;
}