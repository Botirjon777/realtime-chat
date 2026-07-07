import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { Room } from './room.entity';

export enum SenderType {
  CLIENT = 'client',
  OPERATOR = 'operator',
  ADMIN = 'admin',
  BOT = 'bot',
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Room, (room) => room.messages)
  room: Room;

  @Column({
    type: 'varchar',
    length: 20,
  })
  senderType: SenderType;

  @Column()
  senderId: string; // operator id or client uuid

  @Column('text')
  content: string;

  @CreateDateColumn()
  createdAt: Date;
}
