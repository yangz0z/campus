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

## Browser E2E (Playwright)

```ts
import { test, expect } from '@playwright/test';

test('landing hero loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
});
```

- Avoid timeout-based waits — use `waitForResponse` / `waitForLoadState`
- Two browsers in CI: Chromium + WebKit (Firefox skipped — low domestic share)
- Default `webServer.timeout: 120_000` for Next.js dev cold compile
- Project structure:
  - `setup` project (testMatch `auth.setup.ts`) for one-time login
  - `chromium` / `webkit` for unauthenticated landing flows
  - `chromium-authenticated` (`dependencies: ['setup']`, `storageState: ...`) for protected-route flows

## Clerk Authentication Test Helpers

### `+clerk_test` email / fictional phone — official trick

**Source**: <https://clerk.com/docs/testing/test-emails-and-phones>

> "Any email with the `+clerk_test` subaddress is a test email address. No emails will be sent, and they can be verified with the code `424242`."
>
> "Any fictional phone number is a test phone number. No SMS will be sent, and they can all be verified with the code `424242`."

| Type | Pattern | Verification code |
|------|---------|-------------------|
| Email | subaddress includes `+clerk_test` (e.g. `jane+clerk_test@example.com`) | `424242` |
| Phone | `+1 (XXX) 555-0100` ~ `+1 (XXX) 555-0199` | `424242` |

- **Dev instances only** — production rejects this pattern
- No real email/SMS is sent (safe for CI)
- Useful when Clerk forces verification (new device, risk-based) that `setupClerkTestingToken` alone cannot bypass

### Required Clerk Dashboard settings for E2E

1. **User & Authentication → Email, phone, username**
   - `Email address` — ON
   - `Password` — ON
   - `Verification at sign-in` (email code) — OFF (otherwise blocks our flow)
2. **User & Authentication → Multi-factor**
   - All methods — OFF (or "Optional")
3. **(Recommended)** Pre-create a test user via Dashboard with `+clerk_test` email; password is enough.
4. Store credentials in `.env.dev` as `E2E_CLERK_USER_EMAIL` / `E2E_CLERK_USER_PASSWORD` (gitignored).

### Reference implementation in our project

- `apps/web/e2e/auth.setup.ts` — Clerk login + storageState save
- `apps/web/e2e/authenticated.*.spec.ts` — protected-route specs that reuse storageState

```ts
// auth.setup.ts essence
await clerkSetup({ publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY });
await setupClerkTestingToken({ page });
await page.goto('/sign-in', { timeout: 60_000 }); // dev cold-compile may exceed 30s

await page.locator('input[name="identifier"]').fill(email);
await page.locator('button[data-localization-key="formButtonPrimary"]').click();
await page.locator('input[name="password"]').fill(password);
await page.locator('button[data-localization-key="formButtonPrimary"]').click();

// If Clerk forces an email verification (new device, etc.)
const wentToFactorTwo = await page.waitForURL(/factor-two/, { timeout: 5_000 })
  .then(() => true).catch(() => false);
if (wentToFactorTwo) {
  const otpInput = page.locator('input[autocomplete="one-time-code"]').first();
  await otpInput.click();
  await page.keyboard.type('424242', { delay: 50 });
}

await page.waitForURL((url) => !url.pathname.startsWith('/sign-in'));
await page.context().storageState({ path: STORAGE_STATE });
```

## Real-World Pitfalls

### Pitfall 1 — RTL cleanup not auto-registered with `globals: false` (Step 5)

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

### Pitfall 2 — Multiple Clerk setup tests don't share `clerkSetup` effect (Step 6.5a)

**Symptom**: First setup test calls `clerkSetup()`, second one calls `setupClerkTestingToken({ page })` and fails with `Clerk Frontend API URL is required to bypass bot protection`.

**Cause**: Setup tests run in isolation per worker. Side effects of `clerkSetup` don't propagate.

**Fix**: Use a single setup test that runs `clerkSetup` → `setupClerkTestingToken` → login → `storageState` in sequence.

### Pitfall 3 — `name: /계속|continue/i` matches the Google OAuth button (Step 6.5a)

**Symptom**: `getByRole('button', { name: /계속|continue/i })` resolves to 2 elements (strict mode violation).

**Cause**: Clerk renders a "Sign in with Google" button alongside the primary submit button.

**Fix**: Use Clerk's stable selector `data-localization-key="formButtonPrimary"` (language-agnostic):
```ts
await page.locator('button[data-localization-key="formButtonPrimary"]').click();
```

### Pitfall 4 — `page.keyboard.type` fails on OTP input without focus (Step 6.5a)

**Symptom**: OTP boxes remain empty, "Enter code" error appears after submission.

**Cause**: Clerk's 6-cell OTP UI doesn't auto-focus the first input on render.

**Fix**: Click the input first, then type with a small delay so React onChange can distribute digits across cells:
```ts
const otpInput = page.locator('input[autocomplete="one-time-code"]').first();
await otpInput.click();
await page.keyboard.type('424242', { delay: 50 });
```

### Pitfall 5 — Next.js dev cold-compile exceeds default 30s navigation timeout (Step 6.5a)

**Symptom**: Full e2e run fails on first `page.goto('/sign-in')` with timeout, but isolated setup-only run passes.

**Cause**: Next.js dev compiles each route on first request. Cold compile of `/sign-in` (Clerk widget pulls many bundles) can exceed 30s on slower machines.

**Fix**: Pass explicit timeout per navigation:
```ts
await page.goto('/sign-in', { timeout: 60_000 });
```

## Agent Support

- `e2e-runner` — Playwright orchestration
- `typescript-reviewer` — spec code quality
- `a11y-architect` — ARIA and accessibility review (bonus; component tests lean on ARIA roles heavily)

## See Also

- [../testing.md](../testing.md) — TypeScript/JavaScript shared rules
- [../api/testing.md](../api/testing.md) — NestJS API testing rules
- [../../skills/nestjs-testing/SKILL.md](../../skills/nestjs-testing/SKILL.md) — backend testing patterns (reference for contrast)
