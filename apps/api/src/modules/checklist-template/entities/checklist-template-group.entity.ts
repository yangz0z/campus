import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChecklistTemplate } from './checklist-template.entity';
import { ChecklistTemplateItem } from './checklist-template-item.entity';

@Entity('checklist_template_group')
export class ChecklistTemplateGroup {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => ChecklistTemplate, (template) => template.groups, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  template!: ChecklistTemplate;

  @Column({ name: 'template_id', type: 'uuid' })
  templateId!: string;

  @Column({ length: 255 })
  title!: string;

  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder!: number;

  @OneToMany(() => ChecklistTemplateItem, (item) => item.group, {
    cascade: true,
  })
  items!: ChecklistTemplateItem[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
