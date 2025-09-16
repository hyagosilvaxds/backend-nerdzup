import { IsString, IsEnum, IsOptional, IsDateString, IsNotEmpty, IsObject } from 'class-validator';
import { NotificationType, NotificationPriority } from '@prisma/client';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  recipientId: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsObject()
  data?: any;

  @IsOptional()
  @IsString()
  actionUrl?: string;

  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}