import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { createClerkClient } from '@clerk/backend';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
  private clerkClient;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    this.clerkClient = createClerkClient({
      secretKey: this.configService.get<string>('CLERK_SECRET_KEY')!,
    });
  }

  async syncUser(clerkUserId: string): Promise<User> {
    const existing = await this.userRepository.findOne({
      where: { provider: 'google', providerId: clerkUserId },
    });
    if (existing) return existing;

    const clerkUser = await this.clerkClient.users.getUser(clerkUserId);

    const user = this.userRepository.create({
      provider: 'google',
      providerId: clerkUserId,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? null,
      nickname: clerkUser.firstName
        ? `${clerkUser.firstName} ${clerkUser.lastName ?? ''}`.trim()
        : (clerkUser.emailAddresses[0]?.emailAddress?.split('@')[0] ?? 'User'),
      profileImage: clerkUser.imageUrl ?? null,
    });

    return this.userRepository.save(user);
  }
}
