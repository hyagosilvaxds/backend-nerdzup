import { IsOptional, IsInt, Min, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { MessageType } from '@prisma/client';

export class QueryMessagesDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 50;

  @IsOptional()
  @IsDateString()
  before?: string;

  @IsOptional()
  @IsDateString()
  after?: string;

  @IsOptional()
  @IsEnum(MessageType)
  messageType?: MessageType;
}