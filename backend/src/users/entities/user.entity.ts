import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  OPERATOR = 'operator',
}

export enum UserStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  BUSY = 'busy',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: UserRole.OPERATOR,
  })
  role: UserRole;

  @Column({
    type: 'varchar',
    length: 20,
    default: UserStatus.OFFLINE,
  })
  status: UserStatus;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  firstName: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  lastName: string;

  @CreateDateColumn()
  createdAt: Date;
}
