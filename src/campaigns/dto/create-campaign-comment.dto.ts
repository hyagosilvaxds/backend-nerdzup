import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCampaignCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}