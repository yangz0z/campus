import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Season } from '@campus/shared';

export class UpdateTemplateItemDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  title?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(Season, { each: true })
  seasons?: Season[];
}
