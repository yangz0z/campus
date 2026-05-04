// CampGateway 단위 테스트 — Step 7e (WebSocket 영역 첫 학습):
// - Gateway는 controllers가 아니라 providers로 등록 (NestJS 컨벤션)
// - Socket.IO의 client/server 인스턴스를 수작업 mock해야 함
// - @WebSocketServer()가 주입하는 server는 부트 시점에 NestJS가 채워주므로
//   단위 테스트에선 gateway.server = mock 으로 직접 주입
// - @clerk/backend의 verifyToken은 Step 4.5의 vi.hoisted + vi.mock 패턴 재사용
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SocketEvents } from '@campus/shared';
import { Repository } from 'typeorm';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { CampGateway } from './camp.gateway';
import { CampMember } from './entities/camp-member.entity';

// Step 4.5에서 정립한 vi.hoisted 패턴 — vi.mock 팩토리가 즉시 참조하므로 호이스팅 필수
const { verifyTokenMock } = vi.hoisted(() => ({
  verifyTokenMock: vi.fn(),
}));
vi.mock('@clerk/backend', () => ({
  verifyToken: verifyTokenMock,
}));

// ── 헬퍼: Socket.IO client mock ──
// 실제로 Gateway가 호출하는 메서드/필드만 stub (handshake, data, disconnect/join/leave/emit)
function makeSocketMock(authToken?: string) {
  return {
    id: 'socket-test-1',
    handshake: { auth: authToken !== undefined ? { token: authToken } : {} },
    data: {} as Record<string, unknown>,
    disconnect: vi.fn(),
    join: vi.fn(),
    leave: vi.fn(),
    emit: vi.fn(),
  };
}

// ── 헬퍼: Socket.IO server mock with chainable to()/except()/in() ──
function makeServerMock(socketsInRoom = 1) {
  const emit = vi.fn();
  const exceptResult = { emit };
  const except = vi.fn().mockReturnValue(exceptResult);
  const toResult = { emit, except };
  const to = vi.fn().mockReturnValue(toResult);
  const fetchSockets = vi.fn().mockResolvedValue(new Array(socketsInRoom).fill({}));
  const inResult = { fetchSockets };
  const inFn = vi.fn().mockReturnValue(inResult);

  return {
    server: { to, in: inFn } as unknown as Parameters<CampGateway['server']['to']>[0] & {
      to: typeof to;
      in: typeof inFn;
    },
    captures: { to, except, emit, fetchSockets },
  };
}

describe('CampGateway', () => {
  let gateway: CampGateway;
  let configService: { get: ReturnType<typeof vi.fn> };
  let memberRepo: { findOne: ReturnType<typeof vi.fn> };

  // 로그 소음 차단 (Step 3b/4.5 패턴 재사용)
  beforeAll(() => {
    vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  beforeEach(async () => {
    configService = { get: vi.fn().mockReturnValue('test-clerk-secret') };
    memberRepo = { findOne: vi.fn() };
    verifyTokenMock.mockReset();

    const moduleRef = await Test.createTestingModule({
      providers: [
        CampGateway,
        { provide: ConfigService, useValue: configService },
        { provide: getRepositoryToken(CampMember), useValue: memberRepo },
      ],
    }).compile();

    gateway = moduleRef.get<CampGateway>(CampGateway);
  });

  // ────────────────────────────────────────────────────────────────────────
  describe('handleConnection (Clerk 토큰 검증)', () => {
    it('handshake.auth.token이 없으면 즉시 disconnect', async () => {
      const client = makeSocketMock(undefined);

      await gateway.handleConnection(client as never);

      expect(client.disconnect).toHaveBeenCalledTimes(1);
      expect(verifyTokenMock).not.toHaveBeenCalled();
      expect(client.data.clerkUserId).toBeUndefined();
    });

    it('verifyToken 성공 시 client.data.clerkUserId를 payload.sub로 세팅', async () => {
      verifyTokenMock.mockResolvedValue({ sub: 'clerk_user_42' });
      const client = makeSocketMock('valid-token');

      await gateway.handleConnection(client as never);

      expect(verifyTokenMock).toHaveBeenCalledWith('valid-token', {
        secretKey: 'test-clerk-secret',
      });
      expect(client.data.clerkUserId).toBe('clerk_user_42');
      expect(client.disconnect).not.toHaveBeenCalled();
    });

    it('verifyToken이 throw하면 catch하여 disconnect (예외 swallow)', async () => {
      verifyTokenMock.mockRejectedValue(new Error('invalid signature'));
      const client = makeSocketMock('bad-token');

      await gateway.handleConnection(client as never);

      expect(client.disconnect).toHaveBeenCalledTimes(1);
      expect(client.data.clerkUserId).toBeUndefined();
    });
  });

  // ────────────────────────────────────────────────────────────────────────
  describe('handleJoinCamp (멤버 검증 후 room join)', () => {
    it('client.data.clerkUserId가 없으면 disconnect (handleConnection 우회 방지)', async () => {
      const client = makeSocketMock();
      // clerkUserId 미설정 상태

      await gateway.handleJoinCamp(client as never, { campId: 'c1' });

      expect(client.disconnect).toHaveBeenCalledTimes(1);
      expect(memberRepo.findOne).not.toHaveBeenCalled();
      expect(client.join).not.toHaveBeenCalled();
    });

    it('캠프 멤버 확인 성공 시 client.join("camp:<id>") 호출', async () => {
      const client = makeSocketMock();
      client.data.clerkUserId = 'clerk_user_42';
      vi.mocked(memberRepo.findOne).mockResolvedValue({ id: 'm1' } as never);

      await gateway.handleJoinCamp(client as never, { campId: 'c1' });

      expect(memberRepo.findOne).toHaveBeenCalledWith({
        where: { campId: 'c1', user: { providerId: 'clerk_user_42' } },
        relations: ['user'],
      });
      expect(client.join).toHaveBeenCalledWith('camp:c1');
      expect(client.emit).not.toHaveBeenCalled();
    });

    it('캠프 멤버가 아니면 error 이벤트 emit + room join 안 함', async () => {
      const client = makeSocketMock();
      client.data.clerkUserId = 'clerk_user_intruder';
      vi.mocked(memberRepo.findOne).mockResolvedValue(null);

      await gateway.handleJoinCamp(client as never, { campId: 'c1' });

      expect(client.emit).toHaveBeenCalledWith('error', { message: 'Not a member of this camp' });
      expect(client.join).not.toHaveBeenCalled();
    });
  });

  // ────────────────────────────────────────────────────────────────────────
  describe('handleLeaveCamp', () => {
    it('client.leave("camp:<id>") 호출', () => {
      const client = makeSocketMock();

      gateway.handleLeaveCamp(client as never, { campId: 'c1' });

      expect(client.leave).toHaveBeenCalledWith('camp:c1');
    });
  });

  // ────────────────────────────────────────────────────────────────────────
  describe('emitToCamp (room broadcast + excludeSocketId)', () => {
    it('excludeSocketId가 없으면 server.to(room).emit(event, payload)으로 전체 broadcast', async () => {
      const { server, captures } = makeServerMock(2);
      gateway.server = server as never;

      await gateway.emitToCamp('c1', SocketEvents.MEMBER_LEFT, { foo: 1 });

      // room 이름 prefix 'camp:' 검증
      expect(captures.to).toHaveBeenCalledWith('camp:c1');
      // 일반 broadcast: except는 호출되지 않음
      expect(captures.except).not.toHaveBeenCalled();
      expect(captures.emit).toHaveBeenCalledWith(SocketEvents.MEMBER_LEFT, { foo: 1 });
    });

    it('excludeSocketId가 있으면 except(socketId).emit으로 본인 제외 broadcast', async () => {
      const { server, captures } = makeServerMock(3);
      gateway.server = server as never;

      await gateway.emitToCamp('c1', SocketEvents.MEMBER_LEFT, { foo: 2 }, 'self-socket-id');

      expect(captures.to).toHaveBeenCalledWith('camp:c1');
      expect(captures.except).toHaveBeenCalledWith('self-socket-id');
      expect(captures.emit).toHaveBeenCalledWith(SocketEvents.MEMBER_LEFT, { foo: 2 });
    });
  });
});
