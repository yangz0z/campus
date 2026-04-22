// CurrentUserPipe 단위 테스트:
// - AuthService를 useValue로 mock 주입
// - transform 메서드를 직접 호출하여 분기 검증
// - 3 케이스: 빈 입력 / 기존 유저 있음 / 없어서 신규 생성
import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../auth.service';
import { User } from '../../user/entities/user.entity';
import { CurrentUserPipe } from './current-user.decorator';

type AuthServiceMock = Pick<AuthService, 'findByClerkId' | 'createFromClerk'>;

function makeAuthServiceMock(): AuthServiceMock {
  return {
    findByClerkId: vi.fn(),
    createFromClerk: vi.fn(),
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

describe('CurrentUserPipe', () => {
  let pipe: CurrentUserPipe;
  let authService: AuthServiceMock;

  beforeEach(async () => {
    authService = makeAuthServiceMock();

    const moduleRef = await Test.createTestingModule({
      providers: [
        CurrentUserPipe,
        { provide: AuthService, useValue: authService },
      ],
    }).compile();

    pipe = moduleRef.get<CurrentUserPipe>(CurrentUserPipe);
  });

  it('clerkUserId가 빈 문자열이면 UnauthorizedException', async () => {
    await expect(pipe.transform('')).rejects.toThrow(UnauthorizedException);
    expect(authService.findByClerkId).not.toHaveBeenCalled();
    expect(authService.createFromClerk).not.toHaveBeenCalled();
  });

  it('findByClerkId가 기존 유저를 반환하면 createFromClerk 호출 없이 그 유저 반환', async () => {
    // Arrange
    const user = makeUser({ providerId: 'clerk_abc' });
    vi.mocked(authService.findByClerkId).mockResolvedValue(user);

    // Act
    const result = await pipe.transform('clerk_abc');

    // Assert
    expect(authService.findByClerkId).toHaveBeenCalledWith('clerk_abc');
    expect(authService.createFromClerk).not.toHaveBeenCalled();
    expect(result).toBe(user);
  });

  it('findByClerkId가 null 반환 시 createFromClerk로 신규 유저 생성', async () => {
    vi.mocked(authService.findByClerkId).mockResolvedValue(null);
    const created = makeUser({ providerId: 'clerk_new' });
    vi.mocked(authService.createFromClerk).mockResolvedValue(created);

    const result = await pipe.transform('clerk_new');

    expect(authService.findByClerkId).toHaveBeenCalledWith('clerk_new');
    expect(authService.createFromClerk).toHaveBeenCalledWith('clerk_new');
    expect(result).toBe(created);
  });
});
