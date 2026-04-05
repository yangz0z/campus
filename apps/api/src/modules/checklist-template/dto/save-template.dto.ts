import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Season } from '@campus/shared';

export class SaveTemplateItemDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  title!: string;

  @IsArray()
  @IsEnum(Season, { each: true })
  seasons!: Season[];
}

export class SaveTemplateGroupDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaveTemplateItemDto)
  items!: SaveTemplateItemDto[];
}

export class SaveTemplateDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaveTemplateGroupDto)
  groups!: SaveTemplateGroupDto[];
}
