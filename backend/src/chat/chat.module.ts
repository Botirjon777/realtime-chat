import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { Room } from './entities/room.entity';
import { Message } from './entities/message.entity';
import { Feedback } from './entities/feedback.entity';
import { RedisService } from './redis.service';
import { UsersModule } from '../users/users.module';
import { OllamaModule } from '../ollama/ollama.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Room, Message, Feedback]),
    UsersModule,
    OllamaModule,
  ],
  providers: [ChatGateway, ChatService, RedisService],
  exports: [ChatService, RedisService],
})
export class ChatModule {}
