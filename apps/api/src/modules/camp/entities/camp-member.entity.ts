import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Camp } from './camp.entity';

export type CampMemberRole = 'owner' | 'member';

export const CAMP_MEMBER_ROLE = {
  OWNER: 'owner' as const,
  MEMBER: 'member' as const,
};

@Entity('camp_member')
@Unique('uq_camp_member', ['campId', 'userId'])
export class CampMember {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Camp, (camp) => camp.members, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'camp_id' })
  camp!: Camp;

  @Column({ name: 'camp_id', type: 'uuid' })
  campId!: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ length: 10, default: 'member' })
  role!: CampMemberRole;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
