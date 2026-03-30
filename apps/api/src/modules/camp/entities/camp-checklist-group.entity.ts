import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Camp } from './camp.entity';
import { CampChecklistItem } from './camp-checklist-item.entity';

@Entity('camp_checklist_group')
@Unique('uq_camp_checklist_group_sort', ['campId', 'sortOrder'])
export class CampChecklistGroup {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Camp, (camp) => camp.checklistGroups, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  camp!: Camp;

  @Column({ name: 'camp_id', type: 'uuid' })
  campId!: string;

  @Column({ name: 'source_group_id', type: 'uuid', nullable: true })
  sourceGroupId!: string | null;

  @Column({ length: 255 })
  title!: string;

  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder!: number;

  @OneToMany(() => CampChecklistItem, (item) => item.group, { cascade: true })
  items!: CampChecklistItem[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
