import { IsString, IsInt, Min, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@prisma/client';

export class UpdateWalletCreditsDto {
  @IsInt()
  credits: number; // Pode ser positivo (adicionar) ou negativo (remover)

  @IsString()
  description: string;
}

export class PurchaseCreditsDto {
  @IsString()
  packageId: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}

export class CreateSubscriptionDto {
  @IsString()
  planId: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}

export class QueryTransactionsDto {
  @IsString()
  @IsOptional()
  clientId?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}