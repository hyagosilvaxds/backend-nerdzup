import { IsOptional, IsEnum, IsUUID, IsInt, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceRequestStatus } from '@prisma/client';

export class QueryServiceRequestsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @IsEnum(ServiceRequestStatus)
  status?: ServiceRequestStatus;

  @IsOptional()
  @IsUUID()
  serviceId?: string;

  @IsOptional()
  @IsUUID()
  clientId?: string;

  @IsOptional()
  @IsString()
  search?: string;
}