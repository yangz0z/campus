import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Camp } from './entities/camp.entity';
import { CampMember } from './entities/camp-member.entity';
import { CampChecklistGroup } from './entities/camp-checklist-group.entity';
import { CampChecklistItem } from './entities/camp-checklist-item.entity';
import { CampChecklistItemAssignee } from './entities/camp-checklist-item-assignee.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Camp,
      CampMember,
      CampChecklistGroup,
      CampChecklistItem,
      CampChecklistItemAssignee,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class CampModule {}
