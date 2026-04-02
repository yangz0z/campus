import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateChecklistItemDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  title!: string;
}
