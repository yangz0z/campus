import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChecklistTemplateModule } from '../checklist-template/checklist-template.module';
import { Camp } from './entities/camp.entity';
import { CampMember } from './entities/camp-member.entity';
import { CampChecklistGroup } from './entities/camp-checklist-group.entity';
import { CampChecklistItem } from './entities/camp-checklist-item.entity';
import { CampChecklistItemAssignee } from './entities/camp-checklist-item-assignee.entity';
import { CampController } from './camp.controller';
import { CampService } from './camp.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Camp,
      CampMember,
      CampChecklistGroup,
      CampChecklistItem,
      CampChecklistItemAssignee,
    ]),
    ChecklistTemplateModule,
  ],
  controllers: [CampController],
  providers: [CampService],
  exports: [TypeOrmModule],
})
export class CampModule {}
