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
import { Season } from '../../../common/enums/season.enum';
import { User } from '../../user/entities/user.entity';
import { CampMember } from './camp-member.entity';
import { CampChecklistGroup } from './camp-checklist-group.entity';

@Entity('camp')
export class Camp {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index('idx_camp_user_id')
  userId!: string;

  @Column({ length: 255 })
  title!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location!: string | null;

  @Column({ name: 'start_date', type: 'date' })
  startDate!: string;

  @Column({ name: 'end_date', type: 'date' })
  endDate!: string;

  @Column({ type: 'enum', enum: Season })
  season!: Season;

  @OneToMany(() => CampMember, (member) => member.camp, { cascade: true })
  members!: CampMember[];

  @OneToMany(() => CampChecklistGroup, (group) => group.camp, { cascade: true })
  checklistGroups!: CampChecklistGroup[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
