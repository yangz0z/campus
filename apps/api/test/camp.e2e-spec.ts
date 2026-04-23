// POST /camps E2E 테스트 (Step 4.6 — 첫 번째 골든 패스):
// - Testcontainers로 실제 Postgres 컨테이너 스폰
// - AppModule 전체 로드 → 실제 프로덕션과 동일한 DI 그래프
// - ClerkAuthGuard는 .overrideGuard로 인증 통과 + clerkUserId 주입
// - @clerk/backend SDK는 vi.mock으로 완전 차단 (AuthService의 createClerkClient 방지)
// - 테스트 유저를 DB에 미리 INSERT → AuthService.findByClerkId가 바로 hit
import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Season } from '@campus/shared';
import request from 'supertest';
import type { Repository } from 'typeorm';
import { DataSource } from 'typeorm';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { AppModule } from '../src/app.module';
import { Camp } from '../src/modules/camp/entities/camp.entity';
import { CampMember } from '../src/modules/camp/entities/camp-member.entity';
import { User } from '../src/modules/user/entities/user.entity';
import { startTestDatabase, type TestDatabase } from './helpers/test-db';

// @clerk/backend는 외부 네트워크 호출이 있으므로 완전 차단.
// - verifyToken: 실제 Guard 경로를 타게 하되 서명 검증 대신 고정 payload 반환
// - createClerkClient: AuthService 생성자에서 호출되므로 빈 함수로 대체
//
// vi.hoisted로 mock 변수를 호이스팅 (Step 4.5 clerk-auth.guard.spec에서 배운 패턴).
const { verifyTokenMock } = vi.hoisted(() => ({
  verifyTokenMock: vi.fn(),
}));
vi.mock('@clerk/backend', () => ({
  verifyToken: verifyTokenMock,
  createClerkClient: vi.fn(() => ({
    users: { getUser: vi.fn() },
  })),
}));

// 테스트 유저의 clerkUserId — DB 시딩 값과 verifyToken mock payload가 일치해야 함
const TEST_CLERK_USER_ID = 'clerk_test_e2e_user';

describe('POST /camps (E2E)', () => {
  let testDb: TestDatabase;
  let app: INestApplication;
  let campRepo: Repository<Camp>;
  let campMemberRepo: Repository<CampMember>;
  let userRepo: Repository<User>;
  let testUserId: string;

  beforeAll(async () => {
    // 1) Postgres 컨테이너 스폰
    testDb = await startTestDatabase();

    // 2) TypeOrmModule이 읽을 환경변수 주입 (database.config.ts 참고)
    //    localhost URL 포함 → isLocalDb=true → synchronize:true 자동 활성화
    process.env.DATABASE_URL = testDb.databaseUrl;
    process.env.NODE_ENV = 'test';
    // AppModule의 다른 config 누락 대비 더미 값
    process.env.CLERK_SECRET_KEY = 'test-clerk-secret';

    // 3) AppModule 전체 로드 — Guard override 없음.
    //
    // 설계 결정: 가드를 override하지 않고 실제 ClerkAuthGuard가 돌도록 둔다.
    // 대신 외부 의존인 verifyToken만 vi.mock으로 차단하고 고정 payload 반환.
    // → 라우팅·가드·Reflector·파이프·인터셉터 전 경로가 실전과 동일하게 실행됨.
    //
    // 이전 시도 메모: `.overrideProvider(APP_GUARD)`는 실제로 실행 교체를 하지
    // 못해 401이 계속 발생했다. APP_GUARD가 useClass로 등록된 경우 override가
    // 예상대로 동작하지 않는 케이스가 있어, verifyToken mock 방식이 더 안정적.
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    // verifyToken이 기본으로 테스트 유저 payload 반환 → Guard 통과 + req.clerkUserId 세팅
    verifyTokenMock.mockResolvedValue({ sub: TEST_CLERK_USER_ID });

    app = moduleRef.createNestApplication();
    // main.ts의 설정 수동 복제
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    // 4) Repository 핸들 획득 + 테스트 유저 시딩
    userRepo = app.get<Repository<User>>(getRepositoryToken(User));
    campRepo = app.get<Repository<Camp>>(getRepositoryToken(Camp));
    campMemberRepo = app.get<Repository<CampMember>>(getRepositoryToken(CampMember));

    const user = await userRepo.save(
      userRepo.create({
        provider: 'clerk',
        providerId: TEST_CLERK_USER_ID,
        email: 'tester@example.com',
        nickname: '테스터',
        profileImage: null,
      }),
    );
    testUserId = user.id;
  }, 120_000);

  afterAll(async () => {
    // DataSource 명시적으로 닫아 connection pool 정리
    if (app) {
      const dataSource = app.get(DataSource);
      if (dataSource?.isInitialized) await dataSource.destroy();
      await app.close();
    }
    if (testDb) await testDb.container.stop();
  }, 60_000);

  it('Authorization 헤더 없이 요청하면 401 (글로벌 Guard 동작)', async () => {
    await request(app.getHttpServer())
      .post('/camps')
      .send({
        title: '봄 캠프',
        startDate: '2026-05-01',
        endDate: '2026-05-03',
        season: Season.SPRING,
      })
      .expect(401);
  });

  it('유효 인증 + 유효 body → 201 + DB에 Camp/CampMember 실제 레코드 생성', async () => {
    // Arrange
    const body = {
      title: '봄 캠프',
      location: '제주',
      startDate: '2026-05-01',
      endDate: '2026-05-03',
      season: Season.SPRING,
    };

    // Act
    const res = await request(app.getHttpServer())
      .post('/camps')
      .set('Authorization', 'Bearer valid-token')
      .send(body)
      .expect(201);

    // Assert — 응답
    expect(res.body).toHaveProperty('campId');
    const { campId } = res.body as { campId: string };

    // Assert — DB에 실제로 Camp 레코드 생성됨
    const savedCamp = await campRepo.findOne({ where: { id: campId } });
    expect(savedCamp).not.toBeNull();
    expect(savedCamp).toMatchObject({
      title: '봄 캠프',
      location: '제주',
      season: Season.SPRING,
      userId: testUserId,
    });

    // Assert — CampMember도 owner로 생성됨 (트랜잭션 검증)
    const ownerMember = await campMemberRepo.findOne({
      where: { campId, userId: testUserId },
    });
    expect(ownerMember).not.toBeNull();
    expect(ownerMember?.role).toBe('owner');
  });

  it('title 누락 시 400 (글로벌 ValidationPipe 동작)', async () => {
    await request(app.getHttpServer())
      .post('/camps')
      .set('Authorization', 'Bearer valid-token')
      .send({
        // title 누락
        startDate: '2026-05-01',
        endDate: '2026-05-03',
        season: Season.SPRING,
      })
      .expect(400);
  });
});
