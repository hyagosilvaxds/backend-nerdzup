import { IsObject, IsOptional } from 'class-validator';

export class RenderTemplateDto {
  @IsObject()
  @IsOptional()
  variables?: Record<string, any> = {};
}