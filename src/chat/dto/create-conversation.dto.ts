import { IsString, IsOptional, IsEnum, IsUUID, IsArray, IsBoolean } from 'class-validator';
import { ConversationType, ParticipantRole } from '@prisma/client';

export class CreateConversationDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsEnum(ConversationType)
  type: ConversationType;

  @IsOptional()
  @IsUUID()
  taskId?: string;

  @IsOptional()
  @IsUUID()
  campaignId?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  participantIds: string[];
}

export class AddParticipantDto {
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsEnum(ParticipantRole)
  role?: ParticipantRole = ParticipantRole.MEMBER;
}