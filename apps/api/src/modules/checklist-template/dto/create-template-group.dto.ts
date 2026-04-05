import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTemplateGroupDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title!: string;
}
