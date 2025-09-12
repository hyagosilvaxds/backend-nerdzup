import { IsArray, IsString, IsOptional } from 'class-validator';

export class MarkNotificationsReadDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  notificationIds?: string[]; // Se não informado, marca todas como lidas
}

export class MarkNotificationReadDto {
  // Para marcar uma única notificação, apenas o ID no parâmetro da URL é necessário
}