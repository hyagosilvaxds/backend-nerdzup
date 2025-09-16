import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum ClientTaskAction {
  ACCEPT = 'ACCEPT',
  REJECT = 'REJECT',
  COMMENT = 'COMMENT'
}

export class ClientTaskActionDto {
  @IsEnum(ClientTaskAction)
  action: ClientTaskAction;

  @IsOptional()
  @IsString()
  comment?: string; // Obrigatório para REJECT e COMMENT, opcional para ACCEPT

  @IsOptional()
  @IsString()
  reason?: string; // Motivo da rejeição ou observações
}