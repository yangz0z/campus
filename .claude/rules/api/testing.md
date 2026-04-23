> This file extends [../testing.md](../testing.md) with NestJS API-specific testing rules.

# NestJS API Testing Rules

Applies to `apps/api` (NestJS 11 + TypeORM + Vitest).

## File Naming

- Unit/integration specs: `*.spec.ts` (NestJS convention, `nest g` compatible)
- E2E specs: `*.e2e-spec.ts` under `apps/api/test/`
- Place unit specs next to the file under test: `user.service.ts` + `user.service.spec.ts`
- Never use `*.test.ts` in `apps/api` (that is the `packages/shared` convention)

## Unit & Integration Shape

ALWAYS assemble through the DI container, never with `new Service(mock)`:

```ts
const moduleRef = await Test.createTestingModule({
  providers: [
    UserService,
    { provide: getRepositoryToken(User), useValue: repoMock },
  ],
}).compile();
const service = moduleRef.get<UserService>(UserService);
```

- Use `useValue` for mocks (95% of cases)
- Use `getRepositoryToken(Entity)` for TypeORM repository injection
- Create mocks fresh in `beforeEach` (FIRST Independent)
- Extract test data with factory functions (`makeUser`, `makeCamp`)

## Mock Strategy

| Target | Method |
|--------|--------|
| Injected class (e.g. `UserService`) | `{ provide: X, useValue: mock }` |
| External module (e.g. `@clerk/backend`) | `vi.mock('module')` + `vi.hoisted()` when needed |
| Global API (e.g. `fetch`) | `vi.stubGlobal('fetch', vi.fn())` + `afterEach` cleanup |
| Time (`Date.now`, `setTimeout`) | `vi.useFakeTimers()` + `vi.useRealTimers()` in cleanup |
| Logger noise | `vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {})` |

## E2E Shape

```ts
// test/<feature>.e2e-spec.ts
beforeAll(async () => {
  testDb = await startTestDatabase();           // Testcontainers Postgres
  process.env.DATABASE_URL = testDb.databaseUrl;

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],                        // load the full module
  }).compile();

  app = moduleRef.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true })); // replicate main.ts
  await app.init();

  verifyTokenMock.mockResolvedValue({ sub: TEST_CLERK_USER_ID }); // bypass auth
});
```

- REQUIRED: Testcontainers Postgres (not sqlite — enum/jsonb/uuid differ)
- REQUIRED: mock `verifyToken` instead of `.overrideProvider(APP_GUARD)` (see skills/nestjs-testing for the reason)
- REQUIRED: manually replicate every `app.useGlobalPipes/Guards/Filters` from `main.ts`
- REQUIRED: `await app.close()` + `DataSource.destroy()` + `container.stop()` in `afterAll`

## Configuration

- Unit tests → `vitest.config.ts` (include: `src/**/*.spec.ts`)
- E2E tests → `vitest.config.e2e.ts` (include: `test/**/*.e2e-spec.ts`, `hookTimeout: 120_000`)
- Keep `test:e2e` out of the turbo `test` task (E2E is slow; run explicitly)
- `tsconfig.json` includes test files (for editor); `tsconfig.build.json` excludes them

## Validation Gates

Every meaningful change MUST pass all four, in order:

```bash
pnpm --filter api test              # 1. unit logic
pnpm --filter api test:e2e          # 2. E2E (if changed endpoint)
pnpm --filter api build             # 3. dist cleanliness (no *.spec.* leaked)
pnpm turbo run test                 # 4. monorepo regression
```

Each gate catches a different class of failure. Never collapse into a single command.

## DO

- Test service business logic with mocked `Repository`
- Test controller input validation and response shape via `Test.createTestingModule`
- Use E2E only for golden paths (e.g. `POST /camps`) — one or two endpoints per module is enough
- Seed test fixtures through `app.get(getRepositoryToken(...))` in `beforeAll`
- Suppress NestJS `Logger` output with `vi.spyOn(Logger.prototype, ...)` in specs that exercise error paths

## DON'T

- Don't write E2E for every endpoint — rely on unit + DI integration for coverage breadth
- Don't use `.overrideGuard(ClerkAuthGuard)` alone for `APP_GUARD`-registered globals (it often does not replace the execution path)
- Don't run `synchronize: true` together with TS migration paths (ESM/CJS race — branch `nodeEnv === 'test'` to empty migrations)
- Don't leak Clerk / external API calls — always `vi.mock('@clerk/backend')` at the top of any spec that loads `AuthService`
- Don't share mutable state between tests (singleton caches included — use unique inputs or rebuild the module)

## Agent Support

- `e2e-runner` — E2E orchestration
- `tdd-guide` — RED/GREEN/REFACTOR enforcement
- `typescript-reviewer` — review spec code quality

## See Also

- [skills/nestjs-testing/SKILL.md](../../skills/nestjs-testing/SKILL.md) — detailed patterns, code templates, real-world pitfalls from Step 1~4.6
- [../web/testing.md](../web/testing.md) — frontend testing rules (Playwright, RTL)
