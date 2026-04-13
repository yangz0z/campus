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

    const email = clerkUser.emailAddresses[0]?.emailAddress ?? null;

    // providerId 기반 조회 (정확한 매칭)
    const existingById = await this.userRepository.findOne({
      where: { provider, providerId: clerkUserId },
    });
    if (existingById) return existingById;

    // provider + email 기반 조회 (기존 계정 연결)
    if (email) {
      const existingByEmail = await this.userRepository.findOne({
        where: { provider, email },
      });
      if (existingByEmail) {
        existingByEmail.providerId = clerkUserId;
        return this.userRepository.save(existingByEmail);
      }
    }

    // 신규 생성
    const user = this.userRepository.create({
      provider,
      providerId: clerkUserId,
      email,
      nickname: clerkUser.firstName
        ? `${clerkUser.firstName} ${clerkUser.lastName ?? ''}`.trim()
        : (email?.split('@')[0] ?? 'User'),
      profileImage: clerkUser.imageUrl ?? null,
    });

    return this.userRepository.save(user);
  }
}
