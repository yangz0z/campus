// UserService 단위 테스트:
// - Repository<User>를 vi.fn() mock으로 주입하여 DB 없이 로직만 검증
// - Test.createTestingModule 대신 직접 new로 주입하여 DI 보일러플레이트 제거
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Repository } from 'typeorm';
import { UserService } from './user.service';
import { User } from './entities/user.entity';

// Repository에서 실제로 사용하는 메서드만 골라 mock 타입을 좁힘
type UserRepoMock = Pick<Repository<User>, 'findOne' | 'save' | 'create'>;

function makeRepoMock(): UserRepoMock {
  return {
    findOne: vi.fn(),
    save: vi.fn(),
    create: vi.fn(),
  };
}

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'u_1',
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

describe('UserService', () => {
  let repo: UserRepoMock;
  let service: UserService;

  beforeEach(() => {
    repo = makeRepoMock();
    service = new UserService(repo as unknown as Repository<User>);
  });

  describe('findByProviderId', () => {
    it('repository.findOne을 providerId where 절로 호출', async () => {
      // Arrange
      const existing = makeUser({ providerId: 'clerk_abc' });
      vi.mocked(repo.findOne).mockResolvedValue(existing);

      // Act
      const result = await service.findByProviderId('clerk_abc');

      // Assert
      expect(repo.findOne).toHaveBeenCalledTimes(1);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { providerId: 'clerk_abc' } });
      expect(result).toBe(existing);
    });

    it('repository.findOne이 null이면 null 반환', async () => {
      vi.mocked(repo.findOne).mockResolvedValue(null);

      const result = await service.findByProviderId('unknown');

      expect(result).toBeNull();
    });
  });

  describe('findByProviderAndEmail', () => {
    it('provider + email 조합으로 findOne 호출', async () => {
      const existing = makeUser({ provider: 'clerk', email: 'a@b.com' });
      vi.mocked(repo.findOne).mockResolvedValue(existing);

      const result = await service.findByProviderAndEmail('clerk', 'a@b.com');

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { provider: 'clerk', email: 'a@b.com' },
      });
      expect(result).toBe(existing);
    });

    it('일치하는 유저 없으면 null 반환', async () => {
      vi.mocked(repo.findOne).mockResolvedValue(null);

      const result = await service.findByProviderAndEmail('clerk', 'missing@x.com');

      expect(result).toBeNull();
    });
  });

  describe('linkProvider', () => {
    it('전달받은 user의 providerId를 갱신하고 save 결과 반환', async () => {
      // Arrange
      const user = makeUser({ providerId: 'old_id' });
      const saved = makeUser({ providerId: 'new_id' });
      vi.mocked(repo.save).mockResolvedValue(saved);

      // Act
      const result = await service.linkProvider(user, 'new_id');

      // Assert
      expect(user.providerId).toBe('new_id'); // 인자 객체 mutation 확인
      expect(repo.save).toHaveBeenCalledWith(user);
      expect(result).toBe(saved);
    });
  });

  describe('create', () => {
    it('repository.create로 인스턴스 생성 후 save 호출', async () => {
      // Arrange
      const params = {
        provider: 'clerk',
        providerId: 'clerk_new',
        email: 'new@example.com',
        nickname: '신규',
        profileImage: null,
      };
      const draft = makeUser({ ...params, id: 'u_draft' });
      const persisted = makeUser({ ...params, id: 'u_persisted' });
      vi.mocked(repo.create).mockReturnValue(draft);
      vi.mocked(repo.save).mockResolvedValue(persisted);

      // Act
      const result = await service.create(params);

      // Assert
      expect(repo.create).toHaveBeenCalledWith(params);
      expect(repo.save).toHaveBeenCalledWith(draft);
      expect(result).toBe(persisted);
    });
  });
});
