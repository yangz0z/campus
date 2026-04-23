---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---
# TypeScript/JavaScript Testing

> This file extends [common/testing.md](../common/testing.md) with TypeScript/JavaScript specific content for the campus monorepo.

## File Naming

| Location | Pattern | Rationale |
|----------|---------|-----------|
| `apps/api` (NestJS) | `*.spec.ts`, `*.e2e-spec.ts` | `nest g` CLI convention |
| `apps/web` (Next.js) | `*.test.tsx`, `*.test.ts` | React/Vitest convention |
| `packages/shared` (pure TS) | `*.test.ts` | Vitest default |

Do not mix conventions within a workspace.

## Validation Gates

Every meaningful change passes all applicable gates in order:

1. `pnpm --filter <pkg> test` — unit / integration logic
2. `pnpm --filter <pkg> test:e2e` — E2E (where defined)
3. `pnpm --filter <pkg> build` — dist cleanliness (specs must not leak)
4. `pnpm turbo run test` — monorepo regression

Each gate catches a different class of failure. Never collapse into one command.

## E2E Strategy (differs by workspace)

- **API** (`apps/api`): supertest + `createNestApplication` + **Testcontainers Postgres**. See [api/testing.md](api/testing.md).
- **Web** (`apps/web`): **Playwright** for browser automation; Vitest + jsdom + React Testing Library for components. See [web/testing.md](web/testing.md).
- E2E count policy: keep to **golden paths only** (typically 1-2 per surface). Breadth comes from unit + integration, not E2E.

## Unit Test Shape (AAA)

```ts
it('describes the behavior under test', () => {
  // Arrange — build inputs via factories
  // Act — call the subject under test exactly once
  // Assert — verify the outcome or interaction
});
```

- One behavior per test. Extract repeated setup into `make*` factories.
- Prefer `it.each([...])` for parameterized cases.
- Always reset mocks in `beforeEach` (FIRST Independent).

## Tooling

- **Test runner**: Vitest (all workspaces)
- **NestJS integration**: `@nestjs/testing` + `unplugin-swc` (decorator metadata)
- **E2E HTTP**: `supertest`
- **E2E DB**: `testcontainers` + `@testcontainers/postgresql`
- **E2E Browser**: `@playwright/test`
- **Component DOM**: `jsdom` + `@testing-library/react` (planned for Step 5)

## Agent Support

- **tdd-guide** — enforces RED / GREEN / REFACTOR workflow
- **e2e-runner** — Playwright orchestration
- **typescript-reviewer** — spec code quality review
- **pr-test-analyzer** — PR-level coverage review

## Workspace-Specific Rules

- [api/testing.md](api/testing.md) — NestJS API (`apps/api`)
- [web/testing.md](web/testing.md) — Next.js frontend (`apps/web`)

Further detail (patterns, templates, real-world pitfalls) lives in project skills:
- [skills/nestjs-testing/SKILL.md](../skills/nestjs-testing/SKILL.md)
