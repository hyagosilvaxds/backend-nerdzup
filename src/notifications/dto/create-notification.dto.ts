import { IsString, IsEnum, IsOptional, IsJSON, IsDateString, IsUrl } from 'class-validator';
import { NotificationType, NotificationPriority } from '@prisma/client';

export class CreateNotificationDto {
  @IsString()
  recipientId: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsJSON()
  data?: any;

  @IsOptional()
  @IsUrl()
  actionUrl?: string;

  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}