import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClerkClient } from '@clerk/backend';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';

const USER_CACHE_TTL = 5 * 60 * 1000; // 5분

interface CacheEntry {
  promise: Promise<User | null>;
  expiresAt: number;
}

@Injectable()
export class AuthService {
  private clerkClient;
  private userCache = new Map<string, CacheEntry>();

  constructor(
    private userService: UserService,
    private configService: ConfigService,
  ) {
    this.clerkClient = createClerkClient({
      secretKey: this.configService.get<string>('CLERK_SECRET_KEY')!,
    });
  }

  /** clerkUserId로 유저 조회 (캐시 적용, 동시 요청 시 Promise 공유) */
  async findByClerkId(clerkUserId: string): Promise<User | null> {
    const cached = this.userCache.get(clerkUserId);
    if (cached && cached.expiresAt > Date.now()) return cached.promise;

    const promise = this.userService.findByProviderId(clerkUserId);

    this.userCache.set(clerkUserId, {
      promise,
      expiresAt: Date.now() + USER_CACHE_TTL,
    });

    // DB 조회 실패 시 캐시 제거
    promise.catch(() => this.userCache.delete(clerkUserId));

    return promise;
  }

  /** 캐시 무효화 (유저 생성/수정 후 호출) */
  private invalidateCache(clerkUserId: string): void {
    this.userCache.delete(clerkUserId);
  }

  /** Clerk API에서 프로필을 가져와 신규 유저 생성 (또는 기존 계정 연결) */
  async createFromClerk(clerkUserId: string): Promise<User> {
    const clerkUser = await this.clerkClient.users.getUser(clerkUserId);

    const rawProvider = clerkUser.externalAccounts[0]?.provider ?? 'email';
    const provider = rawProvider.startsWith('oauth_')
      ? rawProvider.slice('oauth_'.length)
      : rawProvider;

    const email = clerkUser.emailAddresses[0]?.emailAddress ?? null;

    // provider + email 기반 조회 (기존 계정 연결)
    if (email) {
      const existing = await this.userService.findByProviderAndEmail(provider, email);
      if (existing) {
        const linked = await this.userService.linkProvider(existing, clerkUserId);
        this.invalidateCache(clerkUserId);
        return linked;
      }
    }

    // 신규 생성
    const user = await this.userService.create({
      provider,
      providerId: clerkUserId,
      email,
      nickname: clerkUser.firstName
        ? `${clerkUser.firstName} ${clerkUser.lastName ?? ''}`.trim()
        : (email?.split('@')[0] ?? 'User'),
      profileImage: clerkUser.imageUrl ?? null,
    });

    this.invalidateCache(clerkUserId);
    return user;
  }
}
