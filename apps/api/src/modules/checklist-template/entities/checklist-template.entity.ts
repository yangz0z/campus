import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Season } from '@campus/shared';
import { User } from '../../user/entities/user.entity';
import { ChecklistTemplateGroup } from './checklist-template-group.entity';

@Entity('checklist_template')
export class ChecklistTemplate {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'owner_type', length: 10 })
  ownerType!: 'system' | 'user';

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User | null;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  @Index('idx_template_user_id')
  userId!: string | null;

  @Column({ name: 'source_template_id', type: 'uuid', nullable: true })
  sourceTemplateId!: string | null;

  @ManyToOne(() => ChecklistTemplate, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'source_template_id' })
  sourceTemplate!: ChecklistTemplate | null;

  @Column({
    type: 'enum',
    enum: Season,
    array: true,
    default: `{${Object.values(Season).join(',')}}`,
  })
  seasons!: Season[];

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @OneToMany(() => ChecklistTemplateGroup, (group) => group.template, {
    cascade: true,
  })
  groups!: ChecklistTemplateGroup[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
