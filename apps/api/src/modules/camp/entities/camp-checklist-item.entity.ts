import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { CampChecklistGroup } from './camp-checklist-group.entity';
import { CampChecklistItemAssignee } from './camp-checklist-item-assignee.entity';

@Entity('camp_checklist_item')
@Unique('uq_camp_checklist_item_sort', ['groupId', 'sortOrder'])
export class CampChecklistItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => CampChecklistGroup, (group) => group.items, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'group_id' })
  group!: CampChecklistGroup;

  @Column({ name: 'group_id', type: 'uuid' })
  groupId!: string;

  @Column({ name: 'source_item_id', type: 'uuid', nullable: true })
  sourceItemId!: string | null;

  @Column({ length: 500 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  memo!: string | null;

  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder!: number;

  @Column({ name: 'is_required', default: false })
  isRequired!: boolean;

  @OneToMany(() => CampChecklistItemAssignee, (assignee) => assignee.item, {
    cascade: true,
  })
  assignees!: CampChecklistItemAssignee[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
