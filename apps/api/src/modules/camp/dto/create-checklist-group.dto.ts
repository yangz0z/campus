import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateChecklistGroupDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title!: string;
}
