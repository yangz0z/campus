import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChecklistTemplate } from './entities/checklist-template.entity';
import { ChecklistTemplateGroup } from './entities/checklist-template-group.entity';
import { ChecklistTemplateItem } from './entities/checklist-template-item.entity';
import { ChecklistTemplateService } from './checklist-template.service';
import { ChecklistTemplateController } from './checklist-template.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChecklistTemplate,
      ChecklistTemplateGroup,
      ChecklistTemplateItem,
    ]),
  ],
  controllers: [ChecklistTemplateController],
  providers: [ChecklistTemplateService],
  exports: [TypeOrmModule, ChecklistTemplateService],
})
export class ChecklistTemplateModule {}
