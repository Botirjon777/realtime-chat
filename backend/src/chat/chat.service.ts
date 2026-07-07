import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room, RoomStatus } from './entities/room.entity';
import { Message, SenderType } from './entities/message.entity';
import { Feedback } from './entities/feedback.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
  ) {}

  async saveFeedback(roomId: string, rating: number, isResolved: boolean, comment?: string): Promise<Feedback> {
    const room = await this.findRoom(roomId);
    if (!room) throw new Error('Room not found');

    const feedback = this.feedbackRepository.create({
      room,
      rating,
      isResolved,
      comment,
    });
    return this.feedbackRepository.save(feedback);
  }

  async createRoom(
    clientId: string, 
    clientName?: string, 
    clientContact?: string, 
    topic?: string
  ): Promise<Room> {
    const room = this.roomRepository.create({ 
      clientId, 
      clientName, 
      clientContact, 
      topic,
      status: RoomStatus.WAITING 
    });
    return this.roomRepository.save(room);
  }

  async findRoom(roomId: string): Promise<Room | null> {
    return this.roomRepository.findOne({
      where: { id: roomId },
      relations: ['messages'],
    });
  }

  async saveMessage(roomId: string, senderType: SenderType, senderId: string, content: string): Promise<Message> {
    const room = await this.findRoom(roomId);
    if (!room) throw new Error('Room not found');

    const message = this.messageRepository.create({
      room,
      senderType,
      senderId,
      content,
    });
    return this.messageRepository.save(message);
  }

  async updateRoomStatus(roomId: string, status: RoomStatus): Promise<void> {
    await this.roomRepository.update(roomId, { 
      status,
      closedAt: status === RoomStatus.CLOSED ? new Date() : undefined
    } as any);
  }

  async assignRoom(roomId: string, operatorId: string): Promise<void> {
    await this.roomRepository.update(roomId, { 
      operatorId,
      status: RoomStatus.ACTIVE
    });
  }

  async setRequestedOperator(roomId: string): Promise<void> {
    await this.roomRepository.update(roomId, { requestedOperator: true } as any);
  }

  async getWaitingRooms(): Promise<Room[]> {
    return this.roomRepository.find({
      where: { status: RoomStatus.WAITING },
      order: { createdAt: 'ASC' },
    });
  }

  async findAllRooms(userId?: string, role?: string): Promise<Room[]> {
    const query: any = {
      relations: ['messages'],
      order: { createdAt: 'DESC' },
    };

    if (role === 'operator' && userId) {
      query.where = [
        { status: RoomStatus.WAITING },
        { status: RoomStatus.ACTIVE, operatorId: userId },
        { status: RoomStatus.CLOSED, operatorId: userId },
      ];
    }

    return this.roomRepository.find(query);
  }

  async findAllFeedbacks(): Promise<any[]> {
    return this.feedbackRepository.find({
      relations: ['room'],
      order: { createdAt: 'DESC' },
    });
  }

  async getStatistics() {
    const totalRooms = await this.roomRepository.count();
    const closedRooms = await this.roomRepository.count({ where: { status: RoomStatus.CLOSED } });
    const feedbacks = await this.feedbackRepository.find();
    
    const avgRating = feedbacks.length > 0
      ? feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length
      : 0;

    const totalMessages = await this.messageRepository.count();

    return {
      totalRooms,
      closedRooms,
      activeRooms: totalRooms - closedRooms,
      totalMessages,
      avgRating: Number(avgRating.toFixed(1)),
      totalFeedbacks: feedbacks.length,
    };
  }
}
