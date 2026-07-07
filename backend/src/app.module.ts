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
      useFactory: (configService: ConfigService) => {
        const urlStr = configService.get<string>('DATABASE_URL');
        const config: any = {
          type: 'mssql',
          host: configService.get<string>('DB_HOST') || 'localhost',
          port: configService.get('DB_PORT') ? parseInt(configService.get('DB_PORT')!, 10) : 1433,
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_DATABASE') || 'chat',
          entities: [User, Room, Message, Feedback],
          synchronize: true, // Only for development
          options: {
            encrypt: true,
            trustServerCertificate: true,
            enableArithAbort: true,
          },
          extra: {
            instanceName: configService.get<string>('DB_INSTANCE'),
          },
        };

        if (urlStr) {
          const parts = urlStr.split(';').map(p => p.trim()).filter(p => p);
          const protoHostPort = parts[0]; 
          const hostPortMatches = protoHostPort.replace(/^sqlserver:\/\//i, '').replace(/^mssql:\/\//i, '').split(':');
          if (hostPortMatches[0]) config.host = hostPortMatches[0];
          if (hostPortMatches[1]) config.port = parseInt(hostPortMatches[1], 10);

          for (let i = 1; i < parts.length; i++) {
            const [k, ...vParts] = parts[i].split('=');
            const key = (k || '').trim().toLowerCase();
            const val = vParts.join('=').trim();
            
            if (key === 'database') config.database = val;
            if (key === 'trustservercertificate') config.options.trustServerCertificate = (val.toLowerCase() === 'true');
            if (key === 'integratedsecurity') {
              config.extra.integratedSecurity = (val.toLowerCase() === 'true');
              if (config.extra.integratedSecurity) {
                config.driver = require('mssql/msnodesqlv8');
                // Specify the ODBC driver installed on the system
                config.extra.driver = 'ODBC Driver 17 for SQL Server';
                // msnodesqlv8 requires trustedConnection flag in options
                config.options.trustedConnection = true;
                // Disable strict encryption to avoid SPN cert errors on local machine
                config.options.encrypt = false;
              }
            }
          }
        }

        return config;
      },
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
