> This file extends [common/testing.md](../common/testing.md) with web-specific testing content for `apps/web` (Next.js 15 + React 19 + Tailwind 4).

# Web Testing Rules

## Layer Coverage

| Layer | Tooling | Scope |
|-------|---------|-------|
| Component unit | Vitest + jsdom + `@testing-library/react` | Pure presentation, controlled interactions |
| Visual regression | Playwright screenshots (planned) | Hero, scrollytelling, meaningful states |
| Browser E2E | Playwright (planned Step 6) | Golden user flows with real browser |

Use **component unit tests** for props-driven, deterministic UI. Reserve **E2E** for critical user journeys (1–2 per surface).

## File Naming

- Component tests: `*.test.tsx` next to the component (e.g. `Avatar.tsx` + `Avatar.test.tsx`)
- E2E: `*.e2e.spec.ts` under `apps/web/e2e/` (Playwright convention, when introduced)
- Do NOT use `*.spec.ts` in `apps/web` (`.spec.ts` is reserved for NestJS per `api/testing.md`)

## Component Unit Shape

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SeasonBadge from './SeasonBadge';

it('유효한 seasonId를 주면 해당 계절의 이름을 렌더', () => {
  render(<SeasonBadge seasonId="spring" />);
  expect(screen.getByRole('button', { name: /봄/ })).toBeInTheDocument();
});

it('클릭 시 onClick 콜백 호출', async () => {
  const onClick = vi.fn();
  const user = userEvent.setup();
  render(<SeasonBadge seasonId="fall" onClick={onClick} />);
  await user.click(screen.getByRole('button', { name: /가을/ }));
  expect(onClick).toHaveBeenCalledTimes(1);
});
```

## Testing Library Query Priority

Follow the official order — query closest to how users interact:

1. `getByRole('button', { name: '저장' })` — most accessible
2. `getByLabelText('이메일')` — form controls
3. `getByText('계속')` — visible text
4. `getByTestId('save-btn')` — last resort (`data-testid`)

Avoid `container.querySelector('.css-class')` — brittle to CSS refactors.

## Setup Requirements

`apps/web/vitest.config.ts`:
- `environment: 'jsdom'` for DOM APIs
- `plugins: [react()]` from `@vitejs/plugin-react` for React 19 JSX
- `resolve.alias: { '@': path.resolve(__dirname, './src') }` to match Next.js tsconfig paths
- `setupFiles: ['./test/setup.ts']`

`apps/web/test/setup.ts`:
- `import '@testing-library/jest-dom/vitest'` — extends `expect` with `toBeInTheDocument`, `toHaveClass`, etc.
- **REQUIRED when `globals: false`**: manually register `afterEach(cleanup)`
  (RTL auto-registers cleanup only when `globals: true`)

## DO

- Query by role/label/text — meaning, not structure
- Use `userEvent.setup()` per test for realistic interactions (clicks, keyboard)
- Keep Act (the interaction or render) as one line; factories for Arrange (`makeUser()`)
- Verify presence with `getByRole` when asserting, `queryByRole` when asserting absence
- Verify Tailwind effects via `toHaveClass('bg-pink-50')` (not `toHaveStyle` — jsdom doesn't parse Tailwind)

## DON'T

- Don't test `className` structure or internal state — test user-visible outcomes
- Don't use `fireEvent` when `userEvent` suffices (fireEvent skips focus/bubble nuances)
- Don't render multiple components in one test without `cleanup` — DOM leakage across tests
- Don't test components that depend on server actions or Context providers without dedicated provider test setup (defer to Step 7 or E2E)
- Don't expect motion/animation end states — jsdom doesn't animate; test the static DOM post-render

## Validation Gates

```bash
pnpm --filter web test              # 1. component logic
pnpm --filter web build             # 2. Next.js build (specs auto-excluded from routes)
pnpm turbo run test                 # 3. monorepo regression
```

## Visual Regression (planned)

- Screenshot key breakpoints: 320, 768, 1024, 1440
- Hero, scrollytelling, meaningful states
- If both themes exist, test both
- Visual regression **supplements** unit tests, does not replace them

## Browser E2E (Step 6, planned)

```ts
import { test, expect } from '@playwright/test';

test('landing hero loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
});
```

- Avoid timeout-based waits — use `waitForResponse` / `waitForLoadState`
- Clerk auth bypass via testing tokens (to be decided in Step 6)

## Real-World Pitfalls (discovered in Step 5)

### Pitfall — RTL cleanup not auto-registered with `globals: false`

**Symptom**: previous test's rendered DOM leaks into the next test. `queryByRole('img')` finds the previous test's `<img>`.

**Cause**: `@testing-library/react` auto-registers `afterEach(cleanup)` only when Vitest `globals: true`. With `globals: false` (our convention), it's silently skipped.

**Fix** in `test/setup.ts`:
```ts
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
```

## Agent Support

- `e2e-runner` — Playwright orchestration
- `typescript-reviewer` — spec code quality
- `a11y-architect` — ARIA and accessibility review (bonus; component tests lean on ARIA roles heavily)

## See Also

- [../testing.md](../testing.md) — TypeScript/JavaScript shared rules
- [../api/testing.md](../api/testing.md) — NestJS API testing rules
- [../../skills/nestjs-testing/SKILL.md](../../skills/nestjs-testing/SKILL.md) — backend testing patterns (reference for contrast)
