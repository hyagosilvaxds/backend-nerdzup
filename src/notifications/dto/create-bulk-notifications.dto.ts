import { Type } from 'class-transformer';
import { IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { CreateNotificationDto } from './create-notification.dto';

export class CreateBulkNotificationsDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one notification is required' })
  @ValidateNested({ each: true })
  @Type(() => CreateNotificationDto)
  notifications: CreateNotificationDto[];
}