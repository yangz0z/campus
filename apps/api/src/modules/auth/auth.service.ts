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
    const clerkUser = await this.clerkClient.users.getUser(clerkUserId);

    const rawProvider = clerkUser.externalAccounts[0]?.provider ?? 'email';
    const provider = rawProvider.startsWith('oauth_')
      ? rawProvider.slice('oauth_'.length)
      : rawProvider;

    const existing = await this.userRepository.findOne({
      where: { provider, providerId: clerkUserId },
    });
    if (existing) return existing;

    const user = this.userRepository.create({
      provider,
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
