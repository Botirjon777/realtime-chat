import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './users/entities/user.entity';
import { Room } from './chat/entities/room.entity';
import { Message } from './chat/entities/message.entity';
import { Feedback } from './chat/entities/feedback.entity';
import { ChatModule } from './chat/chat.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mssql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get('DB_PORT') ? parseInt(configService.get('DB_PORT')!, 10) : 1433,
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [User, Room, Message, Feedback],
        synchronize: true, // Only for development
        extra: {
          instanceName: configService.get<string>('DB_INSTANCE'),
        },
        options: {
          encrypt: true,
          trustServerCertificate: true,
          enableArithAbort: true,
        },
      }),
    }),
    AuthModule,
    UsersModule,
    ChatModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
