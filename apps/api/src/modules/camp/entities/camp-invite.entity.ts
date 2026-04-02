import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Camp } from './camp.entity';

@Entity('camp_invite')
@Unique('uq_camp_invite_camp', ['campId'])
export class CampInvite {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', unique: true })
  @Index('idx_camp_invite_token')
  token!: string;

  @ManyToOne(() => Camp, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'camp_id' })
  camp!: Camp;

  @Column({ name: 'camp_id', type: 'uuid' })
  campId!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
