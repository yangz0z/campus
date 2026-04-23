// E2E 테스트용 Postgres 컨테이너 스폰 헬퍼
// - @testcontainers/postgresql 프리셋을 사용해 Docker 이미지 postgres:16-alpine 실행
// - 랜덤 포트 할당 → 병렬 실행 안전
// - getConnectionUri()가 반환하는 URL을 DATABASE_URL로 주입하면 TypeOrmModule이 연결
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';

export interface TestDatabase {
  container: StartedPostgreSqlContainer;
  databaseUrl: string;
}

export async function startTestDatabase(): Promise<TestDatabase> {
  const container = await new PostgreSqlContainer('postgres:16-alpine')
    .withDatabase('campus_test')
    .withUsername('test')
    .withPassword('test')
    .start();

  return {
    container,
    databaseUrl: container.getConnectionUri(),
  };
}
