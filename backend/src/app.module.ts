import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './users/entities/user.entity';
import { Room } from './chat/entities/room.entity';
import { Message } from './chat/entities/message.entity';
import { Feedback } from './chat/entities/feedback.entity';
import { Product } from './products/product.entity';
import { ChatModule } from './chat/chat.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { ProductsModule } from './products/products.module';

/** Parse a sqlserver:// connection string into a TypeORM-compatible config object */
function parseMssqlUrl(urlStr: string, overrideDatabase?: string): any {
  const config: any = {
    type: 'mssql',
    host: 'localhost',
    port: 1433,
    options: {
      encrypt: false,
      trustServerCertificate: true,
      enableArithAbort: true,
      trustedConnection: true,
    },
    extra: {
      driver: 'ODBC Driver 17 for SQL Server',
    },
    driver: require('mssql/msnodesqlv8'),
  };

  if (!urlStr) return config;

  const parts = urlStr.split(';').map(p => p.trim()).filter(p => p);
  const protoHostPort = parts[0];
  const hostPortStr = protoHostPort
    .replace(/^sqlserver:\/\//i, '')
    .replace(/^mssql:\/\//i, '');
  const [host, portStr] = hostPortStr.split(':');
  if (host) config.host = host;
  if (portStr) config.port = parseInt(portStr, 10);

  for (let i = 1; i < parts.length; i++) {
    const [k, ...vParts] = parts[i].split('=');
    const key = (k || '').trim().toLowerCase();
    const val = vParts.join('=').trim();
    if (key === 'database') config.database = val;
    if (key === 'trustservercertificate') config.options.trustServerCertificate = val.toLowerCase() === 'true';
    if (key === 'integratedsecurity' && val.toLowerCase() === 'true') {
      config.extra.integratedSecurity = true;
      config.options.trustedConnection = true;
      config.options.encrypt = false;
    }
  }

  // Allow caller to override the database name (for second connection)
  if (overrideDatabase) config.database = overrideDatabase;

  return config;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ── Default connection: chat database ────────────────────────────────────
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const urlStr = configService.get<string>('DATABASE_URL');
        return {
          ...parseMssqlUrl(urlStr ?? ''),
          entities: [User, Room, Message, Feedback],
          synchronize: true,
        };
      },
    }),

    // ── Named connection: products database (test) ───────────────────────────
    TypeOrmModule.forRootAsync({
      name: 'products',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const urlStr = configService.get<string>('PRODUCTS_DB_URL')
          || configService.get<string>('DATABASE_URL');
        return {
          ...parseMssqlUrl(urlStr ?? '', 'test'),
          entities: [Product],
          synchronize: false, // Never auto-sync the products DB — it's read-only
        };
      },
    }),

    AuthModule,
    UsersModule,
    ChatModule,
    AdminModule,
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
