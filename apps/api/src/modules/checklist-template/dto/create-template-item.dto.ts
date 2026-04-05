import { IsArray, IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Season } from '@campus/shared';

export class CreateTemplateItemDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  title!: string;

  @IsArray()
  @IsEnum(Season, { each: true })
  seasons!: Season[];
}
