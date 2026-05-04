// CampService 단위 테스트 — Step 7d:
// - 23개 public 메서드 전체를 검증하지 않고 새로운 학습 패턴 중심 대표 5개:
//     createCamp / getMyCamps / getIncompleteCount / leaveCamp / kickMember
// - 새 패턴:
//   · DataSource.transaction(cb) mock — cb(manager) 호출 흉내
//   · EntityManager mock (createQueryBuilder, create, save, count, findOneOrFail)
//   · CampGateway.emitToCamp mock으로 WebSocket 부수효과 검증
// - 나머지 메서드(deleteCamp, updateCamp, getCamp, ChecklistItem CRUD 등)는
//   같은 패턴(권한 체크 → 작업 → emit)을 따르므로 회귀 위험은 동일 수준
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Season, SocketEvents } from '@campus/shared';
import { DataSource, Repository } from 'typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ChecklistTemplate } from '../checklist-template/entities/checklist-template.entity';
import { User } from '../user/entities/user.entity';
import { CampService } from './camp.service';
import { CampGateway } from './camp.gateway';
import { Camp } from './entities/camp.entity';
import { CampMember } from './entities/camp-member.entity';
import { CampChecklistGroup } from './entities/camp-checklist-group.entity';
import { CampChecklistItem } from './entities/camp-checklist-item.entity';
import { CampChecklistItemAssignee } from './entities/camp-checklist-item-assignee.entity';
import { CampInvite } from './entities/camp-invite.entity';

// ── 헬퍼: createQueryBuilder fluent chain mock (Step 7b에서 정립한 패턴) ──
function makeQueryBuilderMock(getOneResult: unknown) {
  return {
    leftJoinAndSelect: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    andWhere: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    addOrderBy: vi.fn().mockReturnThis(),
    getOne: vi.fn().mockResolvedValue(getOneResult),
  };
}

// ── 헬퍼: 트랜잭션 manager mock ──
// DataSource.transaction(cb)이 호출되면 manager를 인자로 cb를 실행함을 흉내.
function makeManagerMock(systemTemplate: unknown = null) {
  return {
    create: vi.fn((_Entity, data) => data),
    save: vi.fn(async (_Entity, entity) => ({ ...(entity as object), id: `saved_${Math.random()}` })),
    createQueryBuilder: vi.fn().mockReturnValue(makeQueryBuilderMock(systemTemplate)),
  };
}

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'u_test',
    provider: 'clerk',
    providerId: 'clerk_abc',
    email: 'tester@example.com',
    nickname: '테스터',
    profileImage: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  };
}

describe('CampService', () => {
  let service: CampService;
  let campRepo: { findOne: ReturnType<typeof vi.fn>; remove: ReturnType<typeof vi.fn>; save: ReturnType<typeof vi.fn> };
  let campMemberRepo: { findOne: ReturnType<typeof vi.fn>; find: ReturnType<typeof vi.fn>; remove: ReturnType<typeof vi.fn> };
  let groupRepo: { find: ReturnType<typeof vi.fn> };
  let itemRepo: object;
  let assigneeRepo: object;
  let templateRepo: object;
  let inviteRepo: object;
  let dataSource: { transaction: ReturnType<typeof vi.fn> };
  let campGateway: { emitToCamp: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    campRepo = { findOne: vi.fn(), remove: vi.fn(), save: vi.fn() };
    campMemberRepo = { findOne: vi.fn(), find: vi.fn(), remove: vi.fn() };
    groupRepo = { find: vi.fn() };
    itemRepo = {};
    assigneeRepo = {};
    templateRepo = {};
    inviteRepo = {};
    dataSource = { transaction: vi.fn() };
    campGateway = { emitToCamp: vi.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        CampService,
        { provide: getRepositoryToken(Camp), useValue: campRepo },
        { provide: getRepositoryToken(CampMember), useValue: campMemberRepo },
        { provide: getRepositoryToken(CampChecklistGroup), useValue: groupRepo },
        { provide: getRepositoryToken(CampChecklistItem), useValue: itemRepo },
        { provide: getRepositoryToken(CampChecklistItemAssignee), useValue: assigneeRepo },
        { provide: getRepositoryToken(ChecklistTemplate), useValue: templateRepo },
        { provide: getRepositoryToken(CampInvite), useValue: inviteRepo },
        { provide: DataSource, useValue: dataSource },
        { provide: CampGateway, useValue: campGateway },
      ],
    }).compile();

    service = moduleRef.get<CampService>(CampService);
  });

  // ────────────────────────────────────────────────────────────────────────
  describe('createCamp (트랜잭션 + 시스템 템플릿 복제)', () => {
    it('템플릿이 없어도 Camp + 본인을 owner로 한 CampMember를 트랜잭션으로 생성', async () => {
      // Arrange — 시스템 템플릿이 없는 상태 (queryBuilder.getOne()이 null 반환)
      const manager = makeManagerMock(null);
      // DataSource.transaction(cb)이 호출되면 cb(manager)를 실행하고 반환값을 그대로 반환
      vi.mocked(dataSource.transaction).mockImplementation(async (cb) => {
        return await (cb as (m: typeof manager) => Promise<unknown>)(manager);
      });
      // savedCamp = manager.save가 반환하는 객체에 id가 있어야 함
      vi.mocked(manager.save).mockResolvedValueOnce({ id: 'camp_new' } as never);
      vi.mocked(manager.save).mockResolvedValueOnce({ id: 'member_new' } as never);

      // Act
      const result = await service.createCamp(makeUser(), {
        title: '봄 캠프',
        location: '제주',
        startDate: '2026-05-01',
        endDate: '2026-05-03',
        season: Season.SPRING,
      });

      // Assert
      expect(result).toEqual({ campId: 'camp_new' });
      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
      // Camp 먼저 만들고, 그 id를 가지고 CampMember 만듦
      expect(manager.create).toHaveBeenCalledWith(Camp, expect.objectContaining({
        title: '봄 캠프',
        season: Season.SPRING,
      }));
      expect(manager.create).toHaveBeenCalledWith(CampMember, expect.objectContaining({
        campId: 'camp_new',
        role: 'owner',
      }));
    });

    it('location이 미지정이면 null로 정규화되어 저장', async () => {
      const manager = makeManagerMock(null);
      vi.mocked(dataSource.transaction).mockImplementation(async (cb) =>
        (cb as (m: typeof manager) => Promise<unknown>)(manager),
      );
      vi.mocked(manager.save).mockResolvedValueOnce({ id: 'camp_x' } as never);
      vi.mocked(manager.save).mockResolvedValueOnce({ id: 'mem_x' } as never);

      await service.createCamp(makeUser(), {
        title: '캠프',
        startDate: '2026-05-01',
        endDate: '2026-05-02',
        season: Season.SPRING,
      } as never);

      expect(manager.create).toHaveBeenCalledWith(Camp, expect.objectContaining({
        location: null,
      }));
    });

    it('시스템 템플릿이 있으면 그룹과 시즌 일치 아이템을 함께 복제', async () => {
      // Arrange — 시즌 일치 아이템 1개 + 비일치 아이템 1개
      const systemTemplate = {
        id: 't_sys',
        groups: [
          {
            id: 'tg1',
            title: '의류',
            sortOrder: 0,
            items: [
              { id: 'ti1', title: '자켓', description: null, sortOrder: 0, isRequired: true, seasons: [Season.SPRING] },
              { id: 'ti2', title: '겨울코트', description: null, sortOrder: 1, isRequired: false, seasons: [Season.WINTER] }, // 봄 캠프엔 안 들어감
            ],
          },
        ],
      };
      const manager = makeManagerMock(systemTemplate);
      vi.mocked(dataSource.transaction).mockImplementation(async (cb) =>
        (cb as (m: typeof manager) => Promise<unknown>)(manager),
      );
      // Camp, Member, Group, ChecklistItem, Assignee 순으로 save 호출
      vi.mocked(manager.save).mockImplementation(async (_E, entity) => ({
        ...(entity as object),
        id: `saved_${Math.random().toString(36).slice(2, 6)}`,
      }));

      // Act — 봄 캠프 생성
      await service.createCamp(makeUser(), {
        title: '봄 캠프',
        startDate: '2026-05-01',
        endDate: '2026-05-03',
        season: Season.SPRING,
      } as never);

      // Assert — Camp + Member + Group + 시즌 일치 Item + Assignee = 5번 save
      // (manager.create는 Camp/Member/Group/Item/Assignee 호출됨)
      const createCalls = vi.mocked(manager.create).mock.calls.map((c) => c[0]);
      expect(createCalls).toContain(Camp);
      expect(createCalls).toContain(CampMember);
      expect(createCalls).toContain(CampChecklistGroup);
      expect(createCalls).toContain(CampChecklistItem);
      // 봄에 안 맞는 ti2(WINTER)는 제외 → ChecklistItem create는 1번만 (ti1만)
      const itemCreateCount = createCalls.filter((E) => E === CampChecklistItem).length;
      expect(itemCreateCount).toBe(1);
    });
  });

  // ────────────────────────────────────────────────────────────────────────
  describe('getMyCamps (정렬·매핑)', () => {
    it('내 캠프 목록을 myRole과 함께, 멤버는 owner를 최상단으로 정렬해 반환', async () => {
      // Arrange
      const member1 = {
        role: 'member',
        camp: {
          id: 'c1',
          title: '봄 캠프',
          location: '제주',
          startDate: '2026-05-01',
          endDate: '2026-05-03',
          season: Season.SPRING,
          members: [
            { user: { nickname: 'A', profileImage: null }, role: 'member', createdAt: '2026-04-20T00:00:00Z' },
            { user: { nickname: 'B', profileImage: null }, role: 'owner', createdAt: '2026-04-21T00:00:00Z' }, // 더 늦게 가입했지만 owner
          ],
        },
      };
      vi.mocked(campMemberRepo.find).mockResolvedValue([member1] as never);

      // Act
      const result = await service.getMyCamps(makeUser());

      // Assert — owner가 최상단
      expect(result.camps[0].members[0]).toMatchObject({ nickname: 'B', role: 'owner' });
      expect(result.camps[0].members[1]).toMatchObject({ nickname: 'A', role: 'member' });
      expect(result.camps[0].myRole).toBe('member');
    });
  });

  // ────────────────────────────────────────────────────────────────────────
  describe('getIncompleteCount (권한 + 계산)', () => {
    it('내가 캠프 멤버가 아니면 ForbiddenException', async () => {
      vi.mocked(campMemberRepo.findOne).mockResolvedValue(null);

      await expect(
        service.getIncompleteCount(makeUser(), 'camp_x'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('미완료 아이템(assignees가 없거나 일부만 체크)을 카운트', async () => {
      // Arrange
      vi.mocked(campMemberRepo.findOne).mockResolvedValue({ id: 'm1' } as never);
      vi.mocked(groupRepo.find).mockResolvedValue([
        {
          items: [
            { assignees: [{ isChecked: true }, { isChecked: true }] },     // ✅ 완료
            { assignees: [{ isChecked: true }, { isChecked: false }] },    // ❌ 일부만
            { assignees: [] },                                              // ❌ assignee 0
          ],
        },
      ] as never);

      // Act
      const result = await service.getIncompleteCount(makeUser(), 'camp_x');

      // Assert — 완료 1, 미완료 2
      expect(result).toEqual({ incompleteCount: 2 });
    });
  });

  // ────────────────────────────────────────────────────────────────────────
  describe('leaveCamp (권한 + 오너 거부 + WebSocket emit)', () => {
    it('내가 캠프 멤버가 아니면 ForbiddenException', async () => {
      vi.mocked(campMemberRepo.findOne).mockResolvedValue(null);

      await expect(service.leaveCamp(makeUser(), 'c1')).rejects.toThrow(ForbiddenException);
      expect(campMemberRepo.remove).not.toHaveBeenCalled();
      expect(campGateway.emitToCamp).not.toHaveBeenCalled();
    });

    it('오너는 캠프를 떠날 수 없음 — ForbiddenException + emit 안 함', async () => {
      vi.mocked(campMemberRepo.findOne).mockResolvedValue({
        id: 'm1',
        role: 'owner',
      } as never);

      await expect(service.leaveCamp(makeUser(), 'c1')).rejects.toThrow(ForbiddenException);
      expect(campMemberRepo.remove).not.toHaveBeenCalled();
      expect(campGateway.emitToCamp).not.toHaveBeenCalled();
    });

    it('일반 멤버 탈퇴: remove 후 MEMBER_LEFT 이벤트 broadcast', async () => {
      const member = { id: 'm1', role: 'member' };
      vi.mocked(campMemberRepo.findOne).mockResolvedValue(member as never);

      await service.leaveCamp(makeUser(), 'c1');

      expect(campMemberRepo.remove).toHaveBeenCalledWith(member);
      expect(campGateway.emitToCamp).toHaveBeenCalledWith(
        'c1',
        SocketEvents.MEMBER_LEFT,
        { campId: 'c1', memberId: 'm1' },
      );
    });
  });

  // ────────────────────────────────────────────────────────────────────────
  describe('kickMember (복잡 권한)', () => {
    it('요청자가 멤버 아니면 ForbiddenException', async () => {
      vi.mocked(campMemberRepo.findOne).mockResolvedValue(null);

      await expect(
        service.kickMember(makeUser(), 'c1', 'm_target'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('요청자가 오너가 아니면 ForbiddenException — 권한 격리', async () => {
      // 일반 멤버 권한
      vi.mocked(campMemberRepo.findOne).mockResolvedValueOnce({
        id: 'm_self',
        role: 'member',
      } as never);

      await expect(
        service.kickMember(makeUser(), 'c1', 'm_target'),
      ).rejects.toThrow(ForbiddenException);

      // target 조회조차 시도하지 않음 (1번만 호출)
      expect(campMemberRepo.findOne).toHaveBeenCalledTimes(1);
    });

    it('대상이 오너면 내쫓기 불가 (오너 자기 자신 또는 다른 오너 보호)', async () => {
      vi.mocked(campMemberRepo.findOne)
        .mockResolvedValueOnce({ id: 'm_self', role: 'owner' } as never) // 요청자
        .mockResolvedValueOnce({ id: 'm_target', role: 'owner' } as never); // 타겟

      await expect(
        service.kickMember(makeUser(), 'c1', 'm_target'),
      ).rejects.toThrow(ForbiddenException);
      expect(campMemberRepo.remove).not.toHaveBeenCalled();
    });

    it('오너가 일반 멤버 추방: remove 후 MEMBER_LEFT broadcast', async () => {
      const target = { id: 'm_target', role: 'member' };
      vi.mocked(campMemberRepo.findOne)
        .mockResolvedValueOnce({ id: 'm_self', role: 'owner' } as never)
        .mockResolvedValueOnce(target as never);

      await service.kickMember(makeUser(), 'c1', 'm_target');

      expect(campMemberRepo.remove).toHaveBeenCalledWith(target);
      expect(campGateway.emitToCamp).toHaveBeenCalledWith(
        'c1',
        SocketEvents.MEMBER_LEFT,
        { campId: 'c1', memberId: 'm_target' },
      );
    });

    it('타겟이 존재하지 않으면 NotFoundException', async () => {
      vi.mocked(campMemberRepo.findOne)
        .mockResolvedValueOnce({ id: 'm_self', role: 'owner' } as never)
        .mockResolvedValueOnce(null);

      await expect(
        service.kickMember(makeUser(), 'c1', 'm_invalid'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
