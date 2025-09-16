import { IsString, IsNotEmpty } from 'class-validator';

export class AddClientNoteDto {
  @IsString()
  @IsNotEmpty()
  note: string;
}