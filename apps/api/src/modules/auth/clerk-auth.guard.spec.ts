// ClerkAuthGuard 단위 테스트:
// - @clerk/backend의 verifyToken 은 vi.mock으로 모듈 차단
// - ExecutionContext는 Guard 테스트 고유 패턴 — switchToHttp().getRequest() 체이닝을 수작업 mock
// - Reflector는 useValue로 mock 주입, getAllAndOverride 반환값으로 @Public 메타데이터 제어
import { UnauthorizedException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ClerkAuthGuard } from './clerk-auth.guard';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';

// @clerk/backend의 verifyToken만 mock (createClerkClient는 이 파일에선 쓰지 않음).
//
// 주의 — vi.mock 호이스팅 함정:
// vi.mock의 팩토리는 파일 최상단으로 호이스팅되어 모든 import보다 먼저 실행된다.
// 단순히 `const verifyTokenMock = vi.fn()`을 먼저 선언해도 vi.mock 팩토리가
// 이 변수를 '즉시 참조'하기 때문에 ReferenceError("Cannot access before initialization")가 난다.
//
// 해법: vi.hoisted()로 mock 변수 생성도 vi.mock과 함께 최상단으로 호이스팅.
// (auth.service.spec.ts에선 팩토리 반환의 createClerkClient가 '호출 시점'에만
//  clerkGetUser를 참조하므로 지연 평가되어 문제없이 동작했다.)
const { verifyTokenMock } = vi.hoisted(() => ({
  verifyTokenMock: vi.fn(),
}));

vi.mock('@clerk/backend', () => ({
  verifyToken: verifyTokenMock,
}));

type ReflectorMock = Pick<Reflector, 'getAllAndOverride'>;

function makeContext(options: {
  headers?: Record<string, string>;
} = {}): { ctx: ExecutionContext; request: Record<string, unknown> } {
  // Guard의 switchToHttp().getRequest()에 주입할 요청 객체.
  // verifyToken 성공 시 guard가 request.clerkUserId를 세팅하므로 참조 가능한 객체로 만든다.
  const request: Record<string, unknown> = { headers: options.headers ?? {} };

  const ctx = {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;

  return { ctx, request };
}

describe('ClerkAuthGuard', () => {
  let guard: ClerkAuthGuard;
  let reflector: ReflectorMock;
  let configService: { get: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    reflector = { getAllAndOverride: vi.fn() };
    configService = { get: vi.fn().mockReturnValue('test-clerk-key') };
    verifyTokenMock.mockReset();

    const moduleRef = await Test.createTestingModule({
      providers: [
        ClerkAuthGuard,
        { provide: Reflector, useValue: reflector },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    guard = moduleRef.get<ClerkAuthGuard>(ClerkAuthGuard);
  });

  it('@Public() 메타데이터가 있으면 토큰 검증 없이 true 반환', async () => {
    // Arrange
    vi.mocked(reflector.getAllAndOverride).mockReturnValue(true);
    const { ctx } = makeContext();

    // Act
    const result = await guard.canActivate(ctx);

    // Assert
    expect(result).toBe(true);
    expect(verifyTokenMock).not.toHaveBeenCalled();
  });

  it('@Public() 메타데이터 조회는 handler와 class 둘 다 대상', async () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue(true);
    const { ctx } = makeContext();

    await guard.canActivate(ctx);

    // getAllAndOverride(IS_PUBLIC_KEY, [handler, class]) 호출 검증
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
      IS_PUBLIC_KEY,
      [expect.anything(), expect.anything()],
    );
  });

  it('Authorization 헤더가 없으면 UnauthorizedException', async () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue(false);
    const { ctx } = makeContext({ headers: {} });

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
    expect(verifyTokenMock).not.toHaveBeenCalled();
  });

  it('Authorization이 "Bearer " 형식이 아니면 UnauthorizedException', async () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue(false);
    const { ctx } = makeContext({
      headers: { authorization: 'Basic dXNlcjpwYXNz' },
    });

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
    expect(verifyTokenMock).not.toHaveBeenCalled();
  });

  it('verifyToken 성공 시 request.clerkUserId 설정 후 true 반환', async () => {
    // Arrange
    vi.mocked(reflector.getAllAndOverride).mockReturnValue(false);
    verifyTokenMock.mockResolvedValue({ sub: 'clerk_user_123' });

    const { ctx, request } = makeContext({
      headers: { authorization: 'Bearer valid-token' },
    });

    // Act
    const result = await guard.canActivate(ctx);

    // Assert
    expect(result).toBe(true);
    expect(verifyTokenMock).toHaveBeenCalledWith('valid-token', {
      secretKey: 'test-clerk-key',
    });
    expect(request.clerkUserId).toBe('clerk_user_123');
  });

  it('verifyToken이 throw하면 UnauthorizedException으로 변환', async () => {
    vi.mocked(reflector.getAllAndOverride).mockReturnValue(false);
    verifyTokenMock.mockRejectedValue(new Error('invalid signature'));

    const { ctx, request } = makeContext({
      headers: { authorization: 'Bearer bad-token' },
    });

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
    expect(request.clerkUserId).toBeUndefined();
  });
});
