// CampController 단위 테스트:
// - CampController는 22개 엔드포인트가 모두 CampService로 단순 위임
// - 모든 메서드를 동일 패턴으로 검증하면 반복 비대 → 대표 위임 패턴별로 압축
// - 라우팅/ParseUUIDPipe/ValidationPipe 같은 NestJS 프레임워크 동작은 단위에서 검증 불가
//
// 검증 대상 패턴:
//  1) user + dto                  → create
//  2) user + UUID param           → getCamp
//  3) HTTP 204 (반환 없음) 위임   → leaveCamp
//  4) user + param + body + 헤더  → createChecklistGroup (socketId)
//  5) @Public() + 단일 param      → getCampInviteInfo
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../auth/auth.service';
import { CampController } from './camp.controller';
import { CampService } from './camp.service';
import { User } from '../user/entities/user.entity';

type CampServiceMock = Pick<CampService, | 'createCamp' | 'getCamp' | 'leaveCamp' | 'createChecklistGroup' | 'getCampInviteInfo'>;

function makeUser(): User {
  return {
    id: 'u_test',
    provider: 'clerk',
    providerId: 'clerk_abc',
    email: 'tester@example.com',
    nickname: '테스터',
    profileImage: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };
}

describe('CampController', () => {
  let controller: CampController;
  let campService: CampServiceMock;

  beforeEach(async () => {
    campService = {
      createCamp: vi.fn(),
      getCamp: vi.fn(),
      leaveCamp: vi.fn(),
      createChecklistGroup: vi.fn(),
      getCampInviteInfo: vi.fn(),
    };

    // 함정 — @CurrentUser() 사용 컨트롤러는 CurrentUserPipe → AuthService에 DI 의존.
    // (Step 7b ChecklistTemplateController에서 처음 부딪힌 함정과 동일 — dummy로 해결)
    const moduleRef = await Test.createTestingModule({
      controllers: [CampController],
      providers: [
        { provide: CampService, useValue: campService },
        { provide: AuthService, useValue: {} },
      ],
    }).compile();

    controller = moduleRef.get<CampController>(CampController);
  });

  it('패턴1 — create: user + dto를 그대로 service.createCamp에 전달', async () => {
    // Arrange
    const user = makeUser();
    const dto = {
      title: '봄 캠프',
      location: '제주',
      startDate: '2026-05-01',
      endDate: '2026-05-03',
      season: 'spring' as const,
    };
    const stub = { campId: 'camp_new' };
    vi.mocked(campService.createCamp).mockResolvedValue(stub);

    // Act
    const result = await controller.create(user, dto as never);

    // Assert
    expect(campService.createCamp).toHaveBeenCalledWith(user, dto);
    expect(result).toBe(stub);
  });

  it('패턴2 — getCamp: user + UUID param 위임', async () => {
    const user = makeUser();
    const campId = '11111111-1111-1111-1111-111111111111';
    const stub = { id: campId, title: '캠프' };
    vi.mocked(campService.getCamp).mockResolvedValue(stub as never);

    const result = await controller.getCamp(user, campId);

    expect(campService.getCamp).toHaveBeenCalledWith(user, campId);
    expect(result).toBe(stub);
  });

  it('패턴3 — leaveCamp: HTTP 204 (반환값 없음)도 service에 위임', async () => {
    const user = makeUser();
    const campId = '22222222-2222-2222-2222-222222222222';
    vi.mocked(campService.leaveCamp).mockResolvedValue(undefined as never);

    await controller.leaveCamp(user, campId);

    expect(campService.leaveCamp).toHaveBeenCalledWith(user, campId);
    expect(campService.leaveCamp).toHaveBeenCalledTimes(1);
  });

  it('패턴4 — createChecklistGroup: socketId 헤더를 4번째 인자로 전달', async () => {
    // Arrange
    const user = makeUser();
    const campId = '33333333-3333-3333-3333-333333333333';
    const dto = { title: '의류' };
    const socketId = 'socket-abc';
    const stub = { id: 'g_new' };
    vi.mocked(campService.createChecklistGroup).mockResolvedValue(stub as never);

    // Act
    const result = await controller.createChecklistGroup(user, campId, dto as never, socketId);

    // Assert — 헤더 값이 service에 그대로 전달됨 (WebSocket broadcast 시 본인 제외용)
    expect(campService.createChecklistGroup).toHaveBeenCalledWith(user, campId, dto, socketId);
    expect(result).toBe(stub);
  });

  it('패턴5 — getCampInviteInfo: @Public() 메서드는 user 없이 token만 위임', async () => {
    const stub = { campId: 'c1', campTitle: '봄 캠프' };
    vi.mocked(campService.getCampInviteInfo).mockResolvedValue(stub as never);

    const result = await controller.getCampInviteInfo('invite-token-xyz');

    expect(campService.getCampInviteInfo).toHaveBeenCalledWith('invite-token-xyz');
    expect(result).toBe(stub);
  });
});
