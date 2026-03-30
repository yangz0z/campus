import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChecklistTemplate } from './entities/checklist-template.entity';
import { ChecklistTemplateGroup } from './entities/checklist-template-group.entity';
import { ChecklistTemplateItem } from './entities/checklist-template-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChecklistTemplate,
      ChecklistTemplateGroup,
      ChecklistTemplateItem,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class ChecklistTemplateModule {}
