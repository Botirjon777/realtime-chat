import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  UseGuards, 
  Delete, 
  Param, 
  BadRequestException 
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { ChatService } from '../chat/chat.service';
import { RedisService } from '../chat/redis.service';
import * as bcrypt from 'bcrypt';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(
    private readonly usersService: UsersService,
    private readonly chatService: ChatService,
    private readonly redisService: RedisService,
  ) {}

  @Get('statistics')
  async getStats() {
    return this.chatService.getStatistics();
  }

  @Get('operators')
  async getOperators() {
    const operators = await this.usersService.findByRole(UserRole.OPERATOR);
    const statuses = await this.redisService.getAllStatuses();
    
    return operators.map(op => ({
      ...op,
      status: statuses[op.id.toString()] || 'offline'
    }));
  }

  @Post('operators')
  async createOperator(@Body() data: { email: string; password: string; firstName?: string; lastName?: string }) {
    const existing = await this.usersService.findByEmail(data.email);
    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.usersService.create({
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      role: UserRole.OPERATOR,
    });
  }

  @Get('feedbacks')
  async getFeedbacks() {
    try {
      const feedbacks = await this.chatService.findAllFeedbacks();
      const operators = await this.usersService.findByRole(UserRole.OPERATOR);
      const operatorMap = operators.reduce((acc, op) => {
        acc[op.id.toString()] = `${op.firstName} ${op.lastName}`;
        return acc;
      }, {} as Record<string, string>);

      return feedbacks.map(f => ({
        id: f.id,
        rating: f.rating,
        comment: f.comment,
        isResolved: f.isResolved,
        createdAt: f.createdAt,
        clientName: f.room?.clientName || 'Anonymous',
        clientEmail: f.room?.clientContact || 'No contact info',
        topic: f.room?.topic || 'General',
        operatorName: (f.room && f.room.operatorId) ? (operatorMap[f.room.operatorId] || 'Unknown Operator') : 'Not Assigned',
      }));
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      throw error;
    }
  }

  @Delete('operators/:id')
  async deleteOperator(@Param('id') id: string) {
    // In a real app, you'd want to check if the user exists first
    // and maybe handle cascading room assignments
    return this.usersService.delete(Number(id));
  }
}
