import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Season } from '../../../common/enums/season.enum';

export class CreateCampDto {
  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  location?: string | null;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsEnum(Season)
  season!: Season;
}
