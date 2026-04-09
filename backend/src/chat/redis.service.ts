import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const password = this.configService.get('REDIS_PASSWORD');
    this.client = createClient({
      url: `redis://${this.configService.get('REDIS_HOST')}:${this.configService.get('REDIS_PORT')}`,
      password: password || undefined,
    });
    this.client.on('error', (err) => console.log('Redis Client Error', err));
    await this.client.connect();
  }

  async onModuleDestroy() {
    await this.client.disconnect();
  }

  async setStatus(operatorId: string, status: string) {
    await this.client.set(`operator:${operatorId}:status`, status);
  }

  async getStatus(operatorId: string) {
    return await this.client.get(`operator:${operatorId}:status`);
  }

  async getAllStatuses() {
    const keys = await this.client.keys('operator:*:status');
    const statuses: Record<string, string | null> = {};
    for (const key of keys) {
      const operatorId = key.split(':')[1];
      statuses[operatorId] = await this.client.get(key);
    }
    return statuses;
  }
}
