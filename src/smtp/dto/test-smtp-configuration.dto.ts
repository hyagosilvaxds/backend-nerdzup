import { IsEmail, IsString, IsOptional } from 'class-validator';

export class TestSmtpConfigurationDto {
  @IsEmail()
  testEmail: string;

  @IsString()
  @IsOptional()
  subject?: string = 'Teste de Configuração SMTP';

  @IsString()
  @IsOptional()
  message?: string = 'Esta é uma mensagem de teste para verificar se a configuração SMTP está funcionando corretamente.';
}