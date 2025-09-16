import { IsString, IsEnum, IsOptional, IsDateString, IsObject, IsArray } from 'class-validator';
import { NotificationType, NotificationPriority, Role } from '@prisma/client';

export class BroadcastNotificationDto {
  @IsArray()
  @IsEnum(Role, { each: true })
  targetRoles: Role[];

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