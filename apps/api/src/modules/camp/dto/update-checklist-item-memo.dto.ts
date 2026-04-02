import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateChecklistItemMemoDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  memo!: string | null;
}
