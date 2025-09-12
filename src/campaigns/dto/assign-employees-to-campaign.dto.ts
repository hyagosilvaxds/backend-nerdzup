import { IsArray, IsString } from 'class-validator';

export class AssignEmployeesToCampaignDto {
  @IsArray()
  @IsString({ each: true })
  employeeIds: string[]; // Array de IDs dos funcionários
}