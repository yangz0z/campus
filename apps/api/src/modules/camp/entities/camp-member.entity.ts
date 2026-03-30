import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Camp } from './camp.entity';

@Entity('camp_member')
@Unique('uq_camp_member', ['campId', 'userId'])
export class CampMember {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Camp, (camp) => camp.members, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  camp!: Camp;

  @Column({ name: 'camp_id', type: 'uuid' })
  campId!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ length: 10, default: 'member' })
  role!: 'owner' | 'member';

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
