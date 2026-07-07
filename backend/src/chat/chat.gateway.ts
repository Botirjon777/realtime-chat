import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { RedisService } from './redis.service';
import { UsersService } from '../users/users.service';
import { SenderType } from './entities/message.entity';
import { RoomStatus } from './entities/room.entity';
import { UserRole, UserStatus } from '../users/entities/user.entity';
import { OllamaService, OllamaMessage } from '../ollama/ollama.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly redisService: RedisService,
    private readonly usersService: UsersService,
    private readonly ollamaService: OllamaService,
  ) {}

  async handleConnection(client: Socket) {
    console.log(`Socket connection: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    const operatorId = client.data.operatorId || client.handshake.query.operatorId as string;
    if (operatorId) {
      await this.redisService.setStatus(operatorId, 'offline');
      await this.usersService.updateStatus(Number(operatorId), UserStatus.OFFLINE);
      this.server.emit('operator:status', { operatorId, status: 'offline' });
    }

    const clientId = client.data.clientId;

    // Notify rooms about disconnection and close them if it's a client
    const rooms = Array.from(client.rooms);
    for (const roomId of rooms) {
      if (roomId !== client.id) {
        this.server.to(roomId).emit('user:left', { userId: client.id, roomId });

        // If it's the client of this room, mark it as closed
        if (clientId) {
          await this.chatService.updateRoomStatus(roomId, RoomStatus.CLOSED);
          this.server.to(roomId).emit('room:status', { roomId, status: RoomStatus.CLOSED });

          const room = await this.chatService.findRoom(roomId);
          this.server.to(roomId).emit('room:updated', room);
        }
      }
    }
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('operator:status')
  async handleOperatorStatus(
    @MessageBody() data: { operatorId: string; status: string },
    @ConnectedSocket() client: Socket,
  ) {
    await this.redisService.setStatus(data.operatorId, data.status);
    this.server.emit('operator:status', data);
  }

  @SubscribeMessage('room:init')
  async handleRoomInit(
    @MessageBody() data: {
      clientId: string;
      message?: string;
      clientName?: string;
      clientContact?: string;
      topic?: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    client.data.clientId = data.clientId;
    const room = await this.chatService.createRoom(
      data.clientId,
      data.clientName,
      data.clientContact,
      data.topic,
    );
    client.join(room.id);

    // Save the client's opening message if provided
    if (data.message) {
      const savedMessage = await this.chatService.saveMessage(
        room.id,
        SenderType.CLIENT,
        data.clientId,
        data.message,
      );
      room.messages = [savedMessage];
    }

    client.emit('room:created', room);
    this.server.emit('room:waiting', room); // Notify operators panel

    // ── Fixed welcome message (instant, no Ollama call) ───────────────────────
    const name = data.clientName ? data.clientName.split(' ')[0] : 'there';
    const welcomeText = [
      `👋 Hello ${name}! Welcome to **MAINFrame Custom Cables Store**!`,
      `I'm **Mainframe AI** — your personal cable expert. I can help you discover the perfect cables, sleeving, connectors, and PC modding accessories from our catalog.`,
      `How can I help you today?`,
    ].join('\n\n');

    const botGreeting = await this.chatService.saveMessage(
      room.id,
      SenderType.BOT,
      'ai-bot',
      welcomeText,
    );
    this.server.to(room.id).emit('message:receive', botGreeting);
    // ──────────────────────────────────────────────────────────────────────────
  }

  @SubscribeMessage('operator:identify')
  async handleOperatorIdentify(
    @MessageBody() data: { operatorId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.data.operatorId = data.operatorId;
    await this.redisService.setStatus(data.operatorId, 'online');
    await this.usersService.updateStatus(Number(data.operatorId), UserStatus.ONLINE);
    this.server.emit('operator:status', { operatorId: data.operatorId, status: 'online' });
  }

  @SubscribeMessage('room:join')
  async handleRoomJoin(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const operatorId = client.data.operatorId;
    const room = await this.chatService.findRoom(data.roomId);

    if (room && room.status === RoomStatus.WAITING && operatorId) {
      await this.chatService.assignRoom(data.roomId, operatorId);
      const updatedRoom = await this.chatService.findRoom(data.roomId);
      this.server.to(data.roomId).emit('room:updated', updatedRoom);
      this.server.emit('room:assigned', { roomId: data.roomId, operatorId });
    }

    this.server.to(data.roomId).emit('user:joined', { userId: client.id, roomId: data.roomId });
    client.join(data.roomId);
  }

  @SubscribeMessage('room:close')
  async handleRoomClose(
    @MessageBody() data: { roomId: string },
  ) {
    await this.chatService.updateRoomStatus(data.roomId, RoomStatus.CLOSED);
    this.server.to(data.roomId).emit('room:status', { roomId: data.roomId, status: RoomStatus.CLOSED });

    const room = await this.chatService.findRoom(data.roomId);
    this.server.to(data.roomId).emit('room:updated', room);
  }

  @SubscribeMessage('room:get_all')
  async handleGetAllRooms(@ConnectedSocket() client: Socket) {
    const operatorId = client.data.operatorId;
    let role: UserRole | undefined;

    if (operatorId) {
      const user = await this.usersService.findById(Number(operatorId));
      role = user?.role;
    }

    const rooms = await this.chatService.findAllRooms(operatorId, role);
    client.emit('rooms:all', rooms);
  }

  @SubscribeMessage('message:send')
  async handleMessage(
    @MessageBody() data: { roomId: string; senderId: string; senderType: SenderType; content: string },
  ) {
    try {
      const room = await this.chatService.findRoom(data.roomId);
      if (!room || room.status === RoomStatus.CLOSED) {
        return; // Reject messages to closed rooms
      }

      // Save the client's message and broadcast it immediately
      const message = await this.chatService.saveMessage(
        data.roomId,
        data.senderType,
        data.senderId,
        data.content,
      );
      this.server.to(data.roomId).emit('message:receive', message);
      this.server.emit('message:global_signal', { roomId: data.roomId });

      // ── AI auto-reply ───────────────────────────────────────────────────────
      // Route to Ollama only when:
      //   1. Sender is client
      //   2. No human operator has joined
      //   3. Client has NOT requested a human operator
      const isClientMessage = data.senderType === SenderType.CLIENT;
      const noOperator = !room.operatorId;
      const notEscalated = !room.requestedOperator;

      if (isClientMessage && noOperator && notEscalated) {
        // Build conversation history from room messages (last 10 exchanges)
        const allMessages = room.messages || [];
        const history: OllamaMessage[] = allMessages
          .slice(-10)
          .filter((m) => m.senderType === SenderType.CLIENT || m.senderType === SenderType.BOT)
          .map((m) => ({
            role: (m.senderType === SenderType.CLIENT ? 'user' : 'assistant') as 'user' | 'assistant',
            content: m.content,
          }));

        // Signal frontend that bot is composing a reply
        this.server.to(data.roomId).emit('bot:typing', { roomId: data.roomId });

        // Search products DB + inject as context → Ollama reply
        const aiReply = await this.ollamaService.chatWithProductContext(
          data.content,
          history,
          room.topic,
        );

        const botMessage = await this.chatService.saveMessage(
          data.roomId,
          SenderType.BOT,
          'ai-bot',
          aiReply,
        );
        this.server.to(data.roomId).emit('message:receive', botMessage);
      }
      // ───────────────────────────────────────────────────────────────────────
    } catch (err: any) {
      this.logger.error(`handleMessage error: ${err.message}`, err.stack);
    }
  }

  // ── New: Client requests a human operator ──────────────────────────────────
  @SubscribeMessage('room:request_operator')
  async handleRequestOperator(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = await this.chatService.findRoom(data.roomId);
    if (!room || room.status === RoomStatus.CLOSED) return;

    // Mark room as requesting a human
    await this.chatService.setRequestedOperator(data.roomId);

    // Bot sends a handoff message
    const handoffText =
      "You've requested a human operator. Please hold on — someone from our support team will be with you shortly. 🙌";
    const handoffMsg = await this.chatService.saveMessage(
      data.roomId,
      SenderType.BOT,
      'ai-bot',
      handoffText,
    );
    this.server.to(data.roomId).emit('message:receive', handoffMsg);

    // Re-fetch the updated room and broadcast
    const updatedRoom = await this.chatService.findRoom(data.roomId);
    this.server.to(data.roomId).emit('room:updated', updatedRoom);

    // Notify operators panel (room already has status=waiting, just refresh)
    this.server.emit('room:waiting', updatedRoom);
  }
  // ──────────────────────────────────────────────────────────────────────────

  @SubscribeMessage('user:typing')
  handleTyping(
    @MessageBody() data: { roomId: string; senderId: string; isTyping: boolean },
  ) {
    this.server.to(data.roomId).emit('user:typing', data);
  }

  @SubscribeMessage('feedback:submit')
  async handleFeedbackSubmit(
    @MessageBody() data: { roomId: string; rating: number; isResolved: boolean; comment: string },
  ) {
    await this.chatService.saveFeedback(
      data.roomId,
      data.rating,
      data.isResolved,
      data.comment,
    );
  }
}
