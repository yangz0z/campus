import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { CampChecklistItem } from './camp-checklist-item.entity';
import { CampMember } from './camp-member.entity';

@Entity('camp_checklist_item_assignee')
@Unique('uq_item_assignee', ['itemId', 'memberId'])
export class CampChecklistItemAssignee {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => CampChecklistItem, (item) => item.assignees, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  item!: CampChecklistItem;

  @Column({ name: 'item_id', type: 'uuid' })
  itemId!: string;

  @ManyToOne(() => CampMember, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  member!: CampMember;

  @Column({ name: 'member_id', type: 'uuid' })
  memberId!: string;

  @Column({ name: 'is_checked', default: false })
  isChecked!: boolean;

  @Column({ name: 'checked_at', type: 'timestamptz', nullable: true })
  checkedAt!: Date | null;
}
