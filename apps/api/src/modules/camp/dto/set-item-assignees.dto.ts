import { IsArray, IsUUID } from 'class-validator';

export class SetItemAssigneesDto {
  @IsArray()
  @IsUUID('4', { each: true })
  memberIds!: string[];
}
