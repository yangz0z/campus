---
name: nestjs-testing
description: NestJS unit and E2E testing patterns with Vitest, @nestjs/testing, Testcontainers, and supertest. Enforces `*.spec.ts` naming, DI container-based assembly, and includes real-world pitfalls (vi.hoisted, APP_GUARD override, singleton cache leakage, TypeORM migrations race) discovered while building the campus `apps/api` test suite.
origin: campus
---

# NestJS Testing Patterns

Hands-on guidance for writing tests in `apps/api`. Pairs with [.claude/rules/api/testing.md](../../rules/api/testing.md) (enforced rules) — this file is the **how** and the **why**.

## When to Activate

- Adding a new `*.service.ts`, `*.controller.ts`, `*.guard.ts`, `*.pipe.ts` file in `apps/api`
- Diagnosing a failing NestJS test
- Setting up E2E for a new module
- Reviewing test coverage for the API layer

## Layered Approach

| Layer | Target | Tooling | Speed |
|-------|--------|---------|-------|
| Solitary unit | One class, all deps mocked | Vitest + `Test.createTestingModule` | <10ms |
| DI integration | Controller + mocked Service | Vitest + `useValue` overrides | <30ms |
| API E2E | Real HTTP, real DB | supertest + Testcontainers Postgres | 5-10s |

Keep the pyramid bottom-heavy. E2E belongs only to golden paths (ex: `POST /camps`).

---

## Pattern 1: Service Unit Test (DI-based)

```ts
// user.service.spec.ts
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserService } from './user.service';
import { User } from './entities/user.entity';

type UserRepoMock = Pick<Repository<User>, 'findOne' | 'save' | 'create'>;

function makeRepoMock(): UserRepoMock {
  return { findOne: vi.fn(), save: vi.fn(), create: vi.fn() };
}

describe('UserService', () => {
  let service: UserService;
  let repo: UserRepoMock;

  beforeEach(async () => {
    repo = makeRepoMock();

    const moduleRef = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: repo },
      ],
    }).compile();

    service = moduleRef.get<UserService>(UserService);
  });

  it('repository.findOne을 providerId where 절로 호출', async () => {
    vi.mocked(repo.findOne).mockResolvedValue(makeUser());

    await service.findByProviderId('clerk_abc');

    expect(repo.findOne).toHaveBeenCalledWith({ where: { providerId: 'clerk_abc' } });
  });
});
```

### Keys

- `Pick<Repository<User>, ...>` narrows the mock type to actually-used methods.
- `getRepositoryToken(Entity)` is the ONLY correct token for `@InjectRepository(Entity)`.
- Fresh mock every `beforeEach` — never mutate the same `vi.fn()` across tests.

---

## Pattern 2: Controller Unit Test (useValue override)

```ts
// weather.controller.spec.ts
const moduleRef = await Test.createTestingModule({
  controllers: [WeatherController],
  providers: [{ provide: WeatherService, useValue: weatherServiceMock }],
}).compile();

controller = moduleRef.get(WeatherController);
```

- `controllers: [...]` only for the subject; all deps via `providers`.
- Call methods directly — HTTP layer not involved at this level.
- For `BadRequestException` use `await expect(...).rejects.toThrow(BadRequestException)`.

---

## Pattern 3: External Module Mock (`vi.mock` + `vi.hoisted`)

### When `vi.mock` alone works (lazy reference)

```ts
// The factory returned by vi.fn(() => {...}) is only invoked when
// createClerkClient is called, which happens inside AuthService's
// constructor at runtime. By then `clerkGetUser` is initialized.
const clerkGetUser = vi.fn();
vi.mock('@clerk/backend', () => ({
  createClerkClient: vi.fn(() => ({
    users: { getUser: clerkGetUser },
  })),
}));
```

### When you need `vi.hoisted` (eager reference)

```ts
// vi.mock's factory EVALUATES the returned object at module-load time.
// `verifyToken: verifyTokenMock` evaluates verifyTokenMock eagerly,
// but vi.mock is hoisted ABOVE the `const verifyTokenMock = vi.fn()`
// declaration → ReferenceError "Cannot access before initialization".
//
// vi.hoisted lifts the mock creation to the top alongside vi.mock.
const { verifyTokenMock } = vi.hoisted(() => ({
  verifyTokenMock: vi.fn(),
}));

vi.mock('@clerk/backend', () => ({
  verifyToken: verifyTokenMock,
}));
```

**Rule of thumb**: if the mock variable appears inside a nested function body of the factory, `vi.mock` alone is enough. If it appears at the top level of the returned object, use `vi.hoisted`.

---

## Pattern 4: Guard Test (ExecutionContext mock)

```ts
function makeContext(headers: Record<string, string> = {}) {
  const request: Record<string, unknown> = { headers };
  const ctx = {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  return { ctx, request };
}

it('Bearer 토큰 검증 성공 시 request.clerkUserId 세팅', async () => {
  vi.mocked(reflector.getAllAndOverride).mockReturnValue(false);
  verifyTokenMock.mockResolvedValue({ sub: 'clerk_123' });

  const { ctx, request } = makeContext({ authorization: 'Bearer xyz' });
  await guard.canActivate(ctx);

  expect(request.clerkUserId).toBe('clerk_123');
});
```

- Only implement the `ExecutionContext` methods the guard actually uses.
- `Reflector` mock: `{ getAllAndOverride: vi.fn() }` with `useValue`.

---

## Pattern 5: Time & Cache (`vi.useFakeTimers`)

```ts
vi.useFakeTimers();
vi.setSystemTime(new Date('2026-04-20T00:00:00Z'));

await service.getForecast('서울', 3);    // caches at now

vi.setSystemTime(new Date('2026-04-20T01:00:01Z'));  // +1h 1s
await service.getForecast('서울', 3);    // cache expired, refetches

expect(fetch).toHaveBeenCalledTimes(2);

vi.useRealTimers();  // MANDATORY in afterEach/afterAll
```

Missing `useRealTimers` poisons other test files. Always pair them.

---

## Pattern 6: Logger Noise Suppression

NestJS `Logger.error(...)` pollutes test output when exercising error paths. Native `Logger.overrideLogger(false)` does NOT suppress instance calls reliably.

```ts
beforeAll(() => {
  vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  vi.restoreAllMocks();
});
```

Prototype-level spy covers every `new Logger(...)` instance in the subject code.

---

## Pattern 7: API E2E (Testcontainers + supertest)

```ts
// test/camp.e2e-spec.ts
import { startTestDatabase } from './helpers/test-db';

const { verifyTokenMock } = vi.hoisted(() => ({
  verifyTokenMock: vi.fn(),
}));
vi.mock('@clerk/backend', () => ({
  verifyToken: verifyTokenMock,
  createClerkClient: vi.fn(() => ({ users: { getUser: vi.fn() } })),
}));

const TEST_CLERK_USER_ID = 'clerk_test_e2e_user';

beforeAll(async () => {
  testDb = await startTestDatabase();
  process.env.DATABASE_URL = testDb.databaseUrl;
  process.env.NODE_ENV = 'test';

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleRef.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));  // replicate main.ts
  await app.init();

  // Guard is REAL — only verifyToken is mocked
  verifyTokenMock.mockResolvedValue({ sub: TEST_CLERK_USER_ID });

  // Seed the current user so findByClerkId hits
  userRepo = app.get(getRepositoryToken(User));
  await userRepo.save(userRepo.create({
    provider: 'clerk',
    providerId: TEST_CLERK_USER_ID,
    nickname: 'Tester',
    email: null,
    profileImage: null,
  }));
}, 120_000);

afterAll(async () => {
  const dataSource = app.get(DataSource);
  if (dataSource?.isInitialized) await dataSource.destroy();
  await app.close();
  await testDb.container.stop();
}, 60_000);

it('유효 인증 + 유효 body → 201 + DB에 레코드', async () => {
  const res = await request(app.getHttpServer())
    .post('/camps')
    .set('Authorization', 'Bearer valid-token')
    .send({ title: '봄 캠프', startDate: '2026-05-01', endDate: '2026-05-03', season: 'spring' })
    .expect(201);

  const saved = await campRepo.findOne({ where: { id: res.body.campId } });
  expect(saved).not.toBeNull();
});
```

### Helpers

```ts
// test/helpers/test-db.ts
import { PostgreSqlContainer } from '@testcontainers/postgresql';

export async function startTestDatabase() {
  const container = await new PostgreSqlContainer('postgres:16-alpine')
    .withDatabase('campus_test')
    .withUsername('test')
    .withPassword('test')
    .start();
  return { container, databaseUrl: container.getConnectionUri() };
}
```

---

## Real-World Pitfalls (discovered during Step 1~4.6)

### Pitfall 1 — `vi.mock` hoisting ReferenceError

**Symptom**: `Cannot access 'verifyTokenMock' before initialization`.

**Cause**: `vi.mock` is hoisted above `const mock = vi.fn()`. Its factory evaluates eagerly at module load.

**Fix**: wrap the mock in `vi.hoisted()`. See Pattern 3.

### Pitfall 2 — TypeORM `synchronize` + TS migrations race

**Symptom**: `Unexpected module status 0. Cannot require() ES Module ...CreateUserTable.ts`.

**Cause**: `migrations: [__dirname + '/../migrations/*{.ts,.js}']` makes TypeORM require `.ts` files at boot. Node's ESM/CJS loader races on them.

**Fix** in `database.config.ts`:

```ts
migrations: nodeEnv === 'test' ? [] : [__dirname + '/../migrations/*{.ts,.js}'],
```

`synchronize: true` alone creates the schema from entities in tests.

### Pitfall 3 — `.overrideProvider(APP_GUARD)` does not replace `useClass` globals

**Symptom**: Guard override is applied, but `console.log` inside the override fires 0 times — the real `ClerkAuthGuard` still runs.

**Cause**: When `APP_GUARD` is registered with `useClass: ClerkAuthGuard`, `.overrideProvider(APP_GUARD).useValue(...)` does NOT reliably replace the execution path.

**Fix**: skip the guard override. Mock only the external dependency (`verifyToken`):

```ts
verifyTokenMock.mockResolvedValue({ sub: TEST_CLERK_USER_ID });
```

The real guard then runs, validates the header, calls the mocked `verifyToken`, and sets `request.clerkUserId`. This is actually MORE faithful E2E: the full guard → pipe → service pipeline is exercised end-to-end.

### Pitfall 4 — Singleton service cache shared across tests

**Symptom**: Error-path E2E test returns stale success data from a previous test.

**Cause**: NestJS providers are singletons. Internal `Map`-based caches persist across `it` blocks when a single `beforeAll` creates one app.

**Fix options** (pick the cheapest):
1. Give each test a unique cache key (e.g. different `location`). Lowest cost.
2. Rebuild the module per-test in `beforeEach`. Slow but fully isolated.
3. Expose a `resetCache()` method on the service — only if test needs justify it; usually overkill.

### Pitfall 5 — `Logger.overrideLogger(false)` is unreliable

**Symptom**: Despite calling the official API, error logs still flood the test console.

**Fix**: `vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {})`. Prototype-level spy catches every instance.

---

## Validation Checklist (before marking work done)

- [ ] All four gates pass: `test`, `test:e2e` (if affected), `build`, `turbo run test`
- [ ] No `*.spec.*` or `*.e2e-spec.*` in `apps/api/dist/`
- [ ] No `console.*` output in test runs (except deliberate debugging)
- [ ] `afterEach`/`afterAll` cleans up: `vi.useRealTimers`, `vi.unstubAllGlobals`, `app.close`, `container.stop`
- [ ] New E2E fixture was seeded via `app.get(getRepositoryToken(...))`, not raw SQL
- [ ] Naming conforms: `*.spec.ts` in `src/`, `*.e2e-spec.ts` in `test/`

---

## See Also

- [.claude/rules/api/testing.md](../../rules/api/testing.md) — enforced rules
- [.claude/rules/testing.md](../../rules/testing.md) — TS/JS common testing rules
- `apps/api/src/modules/user/user.service.spec.ts` — reference unit test
- `apps/api/src/modules/weather/weather.controller.spec.ts` — reference controller test with `useValue`
- `apps/api/src/modules/auth/auth.service.spec.ts` — reference cache + external SDK mock test
- `apps/api/test/weather.e2e-spec.ts` — reference E2E without DB
- `apps/api/test/camp.e2e-spec.ts` — reference E2E with Testcontainers Postgres
