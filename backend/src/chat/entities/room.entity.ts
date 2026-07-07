import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Message } from './message.entity';

export enum RoomStatus {
  WAITING = 'waiting',
  ACTIVE = 'active',
  CLOSED = 'closed',
}

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  clientId: string;

  @Column({ nullable: true })
  clientName: string;

  @Column({ nullable: true })
  clientContact: string;

  @Column({ nullable: true })
  topic: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: RoomStatus.WAITING,
  })
  status: RoomStatus;

  @OneToMany(() => Message, (message: Message) => message.room)
  messages: Message[];

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  operatorId: string;

  @Column({ nullable: true })
  closedAt: Date;

  @Column({ default: false })
  requestedOperator: boolean;
}
