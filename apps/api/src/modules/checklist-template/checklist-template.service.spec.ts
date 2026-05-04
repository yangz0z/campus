// ChecklistTemplateService 단위 테스트:
// - Repository 3개 + DataSource(트랜잭션) 의존
// - 트랜잭션 메서드(cloneSystemTemplate, saveTemplate)는 Step 7d로 유예 — 여기선 단순 CRUD + 권한 체크 위주
// - 새로 등장하는 패턴: TypeORM `createQueryBuilder` fluent chain을 `mockReturnThis()`로 mock
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { User } from '../user/entities/user.entity';
import { ChecklistTemplate } from './entities/checklist-template.entity';
import { ChecklistTemplateGroup } from './entities/checklist-template-group.entity';
import { ChecklistTemplateItem } from './entities/checklist-template-item.entity';
import { ChecklistTemplateService } from './checklist-template.service';

type TemplateRepoMock = Pick<Repository<ChecklistTemplate>, 'findOne' | 'create' | 'save'>;
type GroupRepoMock = Pick<
  Repository<ChecklistTemplateGroup>,
  'findOne' | 'create' | 'save' | 'remove' | 'createQueryBuilder'
>;
type ItemRepoMock = Pick<
  Repository<ChecklistTemplateItem>,
  'findOne' | 'create' | 'save' | 'remove' | 'createQueryBuilder'
>;

function makeTemplateRepo(): TemplateRepoMock {
  return { findOne: vi.fn(), create: vi.fn(), save: vi.fn() };
}

function makeGroupRepo(): GroupRepoMock {
  return {
    findOne: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    remove: vi.fn(),
    createQueryBuilder: vi.fn(),
  };
}

function makeItemRepo(): ItemRepoMock {
  return {
    findOne: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    remove: vi.fn(),
    createQueryBuilder: vi.fn(),
  };
}

// 새 패턴 — mockReturnThis():
// TypeORM의 createQueryBuilder는 .select().where().getRawOne() 형태의 fluent chain.
// 모든 중간 메서드가 자기 자신을 반환해야 chain이 깨지지 않으므로 `mockReturnThis()` 사용.
function makeQueryBuilderMock(rawOne: unknown) {
  return {
    select: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    getRawOne: vi.fn().mockResolvedValue(rawOne),
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

describe('ChecklistTemplateService', () => {
  let service: ChecklistTemplateService;
  let templateRepo: TemplateRepoMock;
  let groupRepo: GroupRepoMock;
  let itemRepo: ItemRepoMock;
  let dataSource: { transaction: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    templateRepo = makeTemplateRepo();
    groupRepo = makeGroupRepo();
    itemRepo = makeItemRepo();
    // 트랜잭션 메서드는 이번 spec에선 호출되지 않지만 DI 주입을 위해 placeholder
    dataSource = { transaction: vi.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ChecklistTemplateService,
        { provide: getRepositoryToken(ChecklistTemplate), useValue: templateRepo },
        { provide: getRepositoryToken(ChecklistTemplateGroup), useValue: groupRepo },
        { provide: getRepositoryToken(ChecklistTemplateItem), useValue: itemRepo },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = moduleRef.get<ChecklistTemplateService>(ChecklistTemplateService);
  });

  describe('getMyTemplate', () => {
    it('유저 템플릿이 있으면 변환된 형태(id/title/groups[items])로 반환', async () => {
      // Arrange
      const user = makeUser();
      const template = {
        id: 't1',
        title: '나의 체크리스트',
        groups: [
          {
            id: 'g1',
            title: '의류',
            sortOrder: 0,
            items: [
              { id: 'i1', title: '자켓', seasons: ['winter'], sortOrder: 0 },
            ],
          },
        ],
      };
      vi.mocked(templateRepo.findOne).mockResolvedValue(template as unknown as ChecklistTemplate);

      // Act
      const result = await service.getMyTemplate(user);

      // Assert
      expect(result).toEqual({
        id: 't1',
        title: '나의 체크리스트',
        groups: [
          {
            id: 'g1',
            title: '의류',
            sortOrder: 0,
            items: [
              { id: 'i1', title: '자켓', seasons: ['winter'], sortOrder: 0 },
            ],
          },
        ],
      });
      expect(templateRepo.findOne).toHaveBeenCalledWith({
        where: { userId: user.id, ownerType: 'user' },
        relations: ['groups', 'groups.items'],
        order: { groups: { sortOrder: 'ASC', items: { sortOrder: 'ASC' } } },
      });
    });
  });

  describe('addGroup', () => {
    it('빈 템플릿(그룹 없음)에 추가하면 sortOrder=0', async () => {
      // Arrange — 유저 템플릿 존재
      vi.mocked(templateRepo.findOne).mockResolvedValue({ id: 't1' } as ChecklistTemplate);
      // QueryBuilder가 max=null 반환 (그룹 없음)
      vi.mocked(groupRepo.createQueryBuilder).mockReturnValue(
        makeQueryBuilderMock({ max: null }) as never,
      );
      vi.mocked(groupRepo.create).mockImplementation((dto) => dto as ChecklistTemplateGroup);
      vi.mocked(groupRepo.save).mockImplementation(async (g) => ({
        ...(g as ChecklistTemplateGroup),
        id: 'g_new',
      }));

      // Act
      const result = await service.addGroup(makeUser(), { title: '신규' });

      // Assert
      expect(groupRepo.create).toHaveBeenCalledWith({
        templateId: 't1',
        title: '신규',
        sortOrder: 0, // (max ?? -1) + 1 → 0
      });
      expect(result).toEqual({ id: 'g_new', title: '신규', sortOrder: 0 });
    });

    it('기존 그룹이 있으면 MAX(sortOrder)+1로 추가', async () => {
      vi.mocked(templateRepo.findOne).mockResolvedValue({ id: 't1' } as ChecklistTemplate);
      vi.mocked(groupRepo.createQueryBuilder).mockReturnValue(
        makeQueryBuilderMock({ max: 4 }) as never,
      );
      vi.mocked(groupRepo.create).mockImplementation((dto) => dto as ChecklistTemplateGroup);
      vi.mocked(groupRepo.save).mockImplementation(async (g) => ({
        ...(g as ChecklistTemplateGroup),
        id: 'g_new',
      }));

      await service.addGroup(makeUser(), { title: '5번째' });

      expect(groupRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ sortOrder: 5 }),
      );
    });

    it('유저 템플릿이 없으면 NotFoundException (먼저 getMyTemplate 호출 유도)', async () => {
      vi.mocked(templateRepo.findOne).mockResolvedValue(null);

      await expect(
        service.addGroup(makeUser(), { title: 'x' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateGroup', () => {
    it('그룹의 title을 갱신하고 save 호출', async () => {
      vi.mocked(templateRepo.findOne).mockResolvedValue({ id: 't1' } as ChecklistTemplate);
      const group = { id: 'g1', title: '구', templateId: 't1' };
      vi.mocked(groupRepo.findOne).mockResolvedValue(group as ChecklistTemplateGroup);

      await service.updateGroup(makeUser(), 'g1', '신');

      expect(group.title).toBe('신'); // 인자 mutation
      expect(groupRepo.save).toHaveBeenCalledWith(group);
    });

    it('그룹 없으면 NotFoundException (다른 유저의 그룹 포함)', async () => {
      vi.mocked(templateRepo.findOne).mockResolvedValue({ id: 't1' } as ChecklistTemplate);
      vi.mocked(groupRepo.findOne).mockResolvedValue(null);

      await expect(
        service.updateGroup(makeUser(), 'g_other', '제목'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteGroup', () => {
    it('아이템이 비어있는 그룹은 정상 삭제', async () => {
      vi.mocked(templateRepo.findOne).mockResolvedValue({ id: 't1' } as ChecklistTemplate);
      const group = { id: 'g1', items: [] };
      vi.mocked(groupRepo.findOne).mockResolvedValue(group as ChecklistTemplateGroup);

      await service.deleteGroup(makeUser(), 'g1');

      expect(groupRepo.remove).toHaveBeenCalledWith(group);
    });

    it('아이템이 남아있으면 BadRequestException — 데이터 무결성 보호', async () => {
      vi.mocked(templateRepo.findOne).mockResolvedValue({ id: 't1' } as ChecklistTemplate);
      vi.mocked(groupRepo.findOne).mockResolvedValue({
        id: 'g1',
        items: [{ id: 'i1' }],
      } as ChecklistTemplateGroup);

      await expect(
        service.deleteGroup(makeUser(), 'g1'),
      ).rejects.toThrow(BadRequestException);
      expect(groupRepo.remove).not.toHaveBeenCalled();
    });
  });

  describe('addItem', () => {
    it('그룹 없으면 NotFoundException (권한/존재 확인)', async () => {
      vi.mocked(templateRepo.findOne).mockResolvedValue({ id: 't1' } as ChecklistTemplate);
      vi.mocked(groupRepo.findOne).mockResolvedValue(null);

      await expect(
        service.addItem(makeUser(), 'g_invalid', {
          title: 'x',
          seasons: ['spring'],
        } as never),
      ).rejects.toThrow(NotFoundException);
    });

    it('정상 추가 시 sortOrder가 MAX+1로 자동 할당', async () => {
      vi.mocked(templateRepo.findOne).mockResolvedValue({ id: 't1' } as ChecklistTemplate);
      vi.mocked(groupRepo.findOne).mockResolvedValue({
        id: 'g1',
        templateId: 't1',
      } as ChecklistTemplateGroup);
      vi.mocked(itemRepo.createQueryBuilder).mockReturnValue(
        makeQueryBuilderMock({ max: 2 }) as never,
      );
      vi.mocked(itemRepo.create).mockImplementation((dto) => dto as ChecklistTemplateItem);
      vi.mocked(itemRepo.save).mockImplementation(async (i) => ({
        ...(i as ChecklistTemplateItem),
        id: 'i_new',
      }));

      const result = await service.addItem(makeUser(), 'g1', {
        title: '아이템',
        seasons: ['spring', 'summer'],
      } as never);

      expect(itemRepo.create).toHaveBeenCalledWith({
        groupId: 'g1',
        title: '아이템',
        seasons: ['spring', 'summer'],
        sortOrder: 3,
      });
      expect(result).toEqual({
        id: 'i_new',
        title: '아이템',
        seasons: ['spring', 'summer'],
        sortOrder: 3,
      });
    });
  });

  describe('updateItem', () => {
    it('다른 유저 템플릿의 아이템 수정 시도 시 NotFound (보안)', async () => {
      // Arrange — 내 템플릿 t1, 그러나 아이템은 다른 유저 템플릿 t_other에 속함
      vi.mocked(templateRepo.findOne).mockResolvedValue({ id: 't1' } as ChecklistTemplate);
      vi.mocked(itemRepo.findOne).mockResolvedValue({
        id: 'i1',
        group: { templateId: 't_other' },
      } as ChecklistTemplateItem);

      await expect(
        service.updateItem(makeUser(), 'i1', { title: '해킹' } as never),
      ).rejects.toThrow(NotFoundException);
      expect(itemRepo.save).not.toHaveBeenCalled();
    });

    it('자기 템플릿의 아이템은 정상 수정', async () => {
      vi.mocked(templateRepo.findOne).mockResolvedValue({ id: 't1' } as ChecklistTemplate);
      const item = { id: 'i1', title: '구', seasons: ['spring'], group: { templateId: 't1' } };
      vi.mocked(itemRepo.findOne).mockResolvedValue(item as ChecklistTemplateItem);

      await service.updateItem(makeUser(), 'i1', {
        title: '신',
        seasons: ['summer'],
      } as never);

      expect(item.title).toBe('신');
      expect(item.seasons).toEqual(['summer']);
      expect(itemRepo.save).toHaveBeenCalledWith(item);
    });
  });

  describe('deleteItem', () => {
    it('자기 템플릿의 아이템은 정상 삭제', async () => {
      vi.mocked(templateRepo.findOne).mockResolvedValue({ id: 't1' } as ChecklistTemplate);
      const item = { id: 'i1', group: { templateId: 't1' } };
      vi.mocked(itemRepo.findOne).mockResolvedValue(item as ChecklistTemplateItem);

      await service.deleteItem(makeUser(), 'i1');

      expect(itemRepo.remove).toHaveBeenCalledWith(item);
    });
  });
});
