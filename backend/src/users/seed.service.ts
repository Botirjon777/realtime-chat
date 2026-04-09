import { Injectable, OnModuleInit } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(private readonly usersService: UsersService) {}

  async onModuleInit() {
    await this.seedAdmin();
  }

  private async seedAdmin() {
    const adminEmail = 'admin@chat.com';
    const existingAdmin = await this.usersService.findByEmail(adminEmail);

    if (!existingAdmin) {
      console.log('Seeding initial Super Admin...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await this.usersService.create({
        email: adminEmail,
        password: hashedPassword,
        role: UserRole.ADMIN,
        firstName: 'System',
        lastName: 'Administrator',
      });
      console.log('Super Admin created successfully: admin@chat.com / admin123');
    } else {
      console.log('Super Admin already exists.');
    }
  }
}
