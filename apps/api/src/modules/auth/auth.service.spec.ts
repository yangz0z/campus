// AuthService 단위 테스트:
// - @clerk/backend 는 vi.mock으로 모듈 전체를 교체 (createClerkClient가 생성자에서 실행되므로
//   인스턴스 교체로는 늦음)
// - UserService, ConfigService 는 useValue로 mock 주입
// - fake timers로 5분 TTL 캐시 hit/miss/만료 검증
// - 동시 호출 시 Promise 공유 동작 검증
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { AuthService } from './auth.service';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';

// @clerk/backend 모듈 전체 mock.
// 주의: vi.mock은 파일 최상단으로 호이스팅되어 모든 import보다 먼저 실행된다.
// createClerkClient가 AuthService 생성자에서 호출되기 때문에 여기서 차단해야 한다.
const clerkGetUser = vi.fn();
vi.mock('@clerk/backend', () => ({
  createClerkClient: vi.fn(() => ({
    users: { getUser: clerkGetUser },
  })),
}));

type UserServiceMock = Pick<
  UserService,
  'findByProviderId' | 'findByProviderAndEmail' | 'linkProvider' | 'create'
>;

function makeUserServiceMock(): UserServiceMock {
  return {
    findByProviderId: vi.fn(),
    findByProviderAndEmail: vi.fn(),
    linkProvider: vi.fn(),
    create: vi.fn(),
  };
}

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'u_1',
    provider: 'google',
    providerId: 'clerk_abc',
    email: 'tester@example.com',
    nickname: '테스터',
    profileImage: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

// Clerk API 응답 형태의 mock (필요한 필드만)
function makeClerkUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 'clerk_abc',
    firstName: 'Jane',
    lastName: 'Doe',
    imageUrl: 'https://cdn/img.png',
    emailAddresses: [{ emailAddress: 'jane@example.com' }],
    externalAccounts: [{ provider: 'oauth_google' }],
    ...overrides,
  };
}

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserServiceMock;
  let configService: { get: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    userService = makeUserServiceMock();
    configService = { get: vi.fn().mockReturnValue('test-clerk-key') };
    clerkGetUser.mockReset();

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: userService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = moduleRef.get<AuthService>(AuthService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('findByClerkId (캐시)', () => {
    it('첫 호출 시 userService.findByProviderId 호출 후 결과 반환', async () => {
      // Arrange
      const user = makeUser();
      vi.mocked(userService.findByProviderId).mockResolvedValue(user);

      // Act
      const result = await service.findByClerkId('clerk_abc');

      // Assert
      expect(userService.findByProviderId).toHaveBeenCalledTimes(1);
      expect(userService.findByProviderId).toHaveBeenCalledWith('clerk_abc');
      expect(result).toBe(user);
    });

    it('TTL 이내 재호출 시 userService 호출 없이 캐시에서 반환', async () => {
      const user = makeUser();
      vi.mocked(userService.findByProviderId).mockResolvedValue(user);

      await service.findByClerkId('clerk_abc');
      await service.findByClerkId('clerk_abc');
      await service.findByClerkId('clerk_abc');

      expect(userService.findByProviderId).toHaveBeenCalledTimes(1);
    });

    it('TTL(5분) 경과 후 재호출 시 userService 다시 호출', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-04-20T00:00:00Z'));

      const user = makeUser();
      vi.mocked(userService.findByProviderId).mockResolvedValue(user);

      // 1차 호출 — 캐시 저장 (expiresAt = now + 5min)
      await service.findByClerkId('clerk_abc');

      // 4분 59초 경과 — 여전히 캐시 hit
      vi.setSystemTime(new Date('2026-04-20T00:04:59Z'));
      await service.findByClerkId('clerk_abc');
      expect(userService.findByProviderId).toHaveBeenCalledTimes(1);

      // 5분 1초 경과 — 캐시 만료 → userService 재호출
      vi.setSystemTime(new Date('2026-04-20T00:05:01Z'));
      await service.findByClerkId('clerk_abc');
      expect(userService.findByProviderId).toHaveBeenCalledTimes(2);
    });

    it('동시 호출 시 Promise를 공유하여 userService 1회만 호출', async () => {
      // Arrange — findByProviderId가 천천히 resolve되도록 Deferred 패턴
      let resolveUser: (u: User) => void = () => {};
      const pendingPromise = new Promise<User>(resolve => {
        resolveUser = resolve;
      });
      vi.mocked(userService.findByProviderId).mockReturnValue(pendingPromise);

      // Act — resolve 전에 동시에 두 번 호출
      const p1 = service.findByClerkId('clerk_abc');
      const p2 = service.findByClerkId('clerk_abc');

      // 이제 한 번만 resolve
      resolveUser(makeUser());
      const [r1, r2] = await Promise.all([p1, p2]);

      // Assert
      expect(userService.findByProviderId).toHaveBeenCalledTimes(1);
      expect(r1).toBe(r2); // 같은 Promise 공유
    });

    it('userService가 reject하면 캐시에서 제거되어 재호출 가능', async () => {
      // Arrange — 첫 호출은 실패
      vi.mocked(userService.findByProviderId)
        .mockRejectedValueOnce(new Error('db down'))
        .mockResolvedValueOnce(makeUser());

      // Act 1 — 실패 → 캐시에서 제거됨
      await expect(service.findByClerkId('clerk_abc')).rejects.toThrow('db down');

      // Act 2 — 재호출하면 userService 다시 호출
      const result = await service.findByClerkId('clerk_abc');

      // Assert
      expect(userService.findByProviderId).toHaveBeenCalledTimes(2);
      expect(result).toBeDefined();
    });
  });

  describe('createFromClerk', () => {
    it('email + 기존 계정 있으면 linkProvider 호출 후 기존 유저 반환', async () => {
      // Arrange
      const existing = makeUser({ id: 'u_existing', providerId: 'old_id' });
      const linked = makeUser({ id: 'u_existing', providerId: 'clerk_abc' });
      clerkGetUser.mockResolvedValue(makeClerkUser());
      vi.mocked(userService.findByProviderAndEmail).mockResolvedValue(existing);
      vi.mocked(userService.linkProvider).mockResolvedValue(linked);

      // Act
      const result = await service.createFromClerk('clerk_abc');

      // Assert
      expect(userService.findByProviderAndEmail).toHaveBeenCalledWith(
        'google', // 'oauth_google' → prefix 제거
        'jane@example.com',
      );
      expect(userService.linkProvider).toHaveBeenCalledWith(existing, 'clerk_abc');
      expect(userService.create).not.toHaveBeenCalled();
      expect(result).toBe(linked);
    });

    it('기존 계정 없으면 userService.create로 신규 유저 생성', async () => {
      clerkGetUser.mockResolvedValue(makeClerkUser());
      vi.mocked(userService.findByProviderAndEmail).mockResolvedValue(null);

      const created = makeUser({ nickname: 'Jane Doe' });
      vi.mocked(userService.create).mockResolvedValue(created);

      const result = await service.createFromClerk('clerk_abc');

      expect(userService.create).toHaveBeenCalledWith({
        provider: 'google',
        providerId: 'clerk_abc',
        email: 'jane@example.com',
        nickname: 'Jane Doe',
        profileImage: 'https://cdn/img.png',
      });
      expect(userService.linkProvider).not.toHaveBeenCalled();
      expect(result).toBe(created);
    });

    it('firstName이 없으면 email의 local part를 nickname으로 사용', async () => {
      clerkGetUser.mockResolvedValue(
        makeClerkUser({ firstName: null, lastName: null }),
      );
      vi.mocked(userService.findByProviderAndEmail).mockResolvedValue(null);
      vi.mocked(userService.create).mockImplementation(
        async (params) => makeUser({ nickname: params.nickname }),
      );

      await service.createFromClerk('clerk_abc');

      expect(userService.create).toHaveBeenCalledWith(
        expect.objectContaining({ nickname: 'jane' }), // 'jane@example.com' → 'jane'
      );
    });

    it('firstName/email 모두 없으면 nickname은 "User" fallback', async () => {
      clerkGetUser.mockResolvedValue(
        makeClerkUser({
          firstName: null,
          lastName: null,
          emailAddresses: [],
          externalAccounts: [],
        }),
      );
      // email 없음 → findByProviderAndEmail 자체가 호출 안 됨
      vi.mocked(userService.create).mockImplementation(
        async (params) => makeUser({ nickname: params.nickname }),
      );

      await service.createFromClerk('clerk_abc');

      expect(userService.findByProviderAndEmail).not.toHaveBeenCalled();
      expect(userService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'email', // externalAccounts 없으면 'email' fallback
          nickname: 'User',
          email: null,
        }),
      );
    });
  });
});
