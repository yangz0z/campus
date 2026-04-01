import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Season } from '@campus/shared';
import { ChecklistTemplateGroup } from './checklist-template-group.entity';

@Entity('checklist_template_item')
export class ChecklistTemplateItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => ChecklistTemplateGroup, (group) => group.items, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'group_id' })
  group!: ChecklistTemplateGroup;

  @Column({ name: 'group_id', type: 'uuid' })
  groupId!: string;

  @Column({ length: 500 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder!: number;

  @Column({ name: 'is_required', default: false })
  isRequired!: boolean;

  @Column({
    type: 'enum',
    enum: Season,
    array: true,
    default: `{${Object.values(Season).join(',')}}`,
  })
  seasons!: Season[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
