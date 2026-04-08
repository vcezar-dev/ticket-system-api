import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Status } from '../enums/status.enum';
import { Priority } from '../enums/priority.enum';
import { Category } from '../enums/category.enum';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  title!: string;

  @Column({ type: 'varchar', length: 300 })
  description!: string;

  @Column({ type: 'enum', enum: Status, default: Status.Open })
  status!: Status;

  @Column({ type: 'enum', enum: Priority, default: Priority.Low })
  priority!: Priority;

  @Column({ type: 'enum', enum: Category, default: Category.Other })
  category!: Category;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  createdBy!: User | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_to_id' })
  assignedTo!: User | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
