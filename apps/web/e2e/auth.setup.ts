// Clerk 로그인 setup — Step 6.5a:
// - playwright.config.ts의 'setup' project가 이 파일만 실행
// - clerkSetup() — Clerk testing token(봇 감지 우회) 가져오기
// - setupClerkTestingToken({ page }) — 페이지 시작 시 토큰을 쿠키에 주입
// - sign-in 폼 자동화 → storageState 저장 → 이후 인증 spec이 재사용
//
// 주의 — 셀렉터 식별:
// Clerk SignIn 위젯의 input은 <input name="identifier">, <input name="password">
// 가 표준. 한국어 localization(koKR) 사용 중이라 버튼 텍스트는 "계속" 또는 "Continue".
// "/i" 정규식으로 양쪽 매칭.
import { clerkSetup, setupClerkTestingToken } from '@clerk/testing/playwright';
import { test as setup, expect } from '@playwright/test';
import path from 'node:path';

const authFile = path.join(__dirname, '..', 'playwright', '.auth', 'user.json');

// 함정 — 두 setup 테스트로 분리하면 격리 실행되어 clerkSetup 효과가 전파되지 않음.
// 하나의 setup에서 clerkSetup → setupClerkTestingToken → 로그인 → storageState 순으로 처리.
setup('Clerk testing 셋업 + 테스트 유저 로그인 후 storageState 저장', async ({ page }) => {
  // Next.js dev mode는 첫 요청 시 페이지 컴파일에 수십 초 걸리는 경우 있음.
  // 전체 e2e 실행에선 webServer가 막 시작됐을 가능성이 높아 기본 30초로는 부족.
  setup.setTimeout(120_000);

  await clerkSetup({
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  });

  const email = process.env.E2E_CLERK_USER_EMAIL;
  const password = process.env.E2E_CLERK_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'E2E_CLERK_USER_EMAIL/PASSWORD 환경변수 누락. .env.dev 확인 필요.',
    );
  }

  // 페이지 시작 전 testing token 주입 (Bot 감지 우회)
  await setupClerkTestingToken({ page });

  // Next.js dev 첫 컴파일이 30초 넘는 경우가 있어 navigation timeout을 60초로
  await page.goto('/sign-in', { timeout: 60_000 });

  // 1단계 — 이메일(identifier) 입력
  await page.locator('input[name="identifier"]').fill(email);
  // 함정 — getByRole({ name: /계속|continue/i })는 Google OAuth 버튼까지 매칭.
  // Clerk의 안정적 셀렉터: data-localization-key="formButtonPrimary" (언어 무관).
  await page.locator('button[data-localization-key="formButtonPrimary"]').click();

  // 2단계 — 비밀번호 입력
  await page.locator('input[name="password"]').fill(password);
  // 함정 — getByRole({ name: /계속|continue/i })는 Google OAuth 버튼까지 매칭.
  // Clerk의 안정적 셀렉터: data-localization-key="formButtonPrimary" (언어 무관).
  await page.locator('button[data-localization-key="formButtonPrimary"]').click();

  // 3단계 (조건부) — Clerk dev instance가 새 기기/IP 감지 시 email verification 강제.
  // E2E_CLERK_USER_EMAIL이 +clerk_test 형태면 코드는 항상 424242로 자동 통과 (Clerk testing 트릭).
  // factor-two로 잠시 갔다가 다른 페이지로 자동 redirect 가능 → 짧은 timeout으로 우회.
  const wentToFactorTwo = await page
    .waitForURL(/factor-two/, { timeout: 5_000 })
    .then(() => true)
    .catch(() => false);

  if (wentToFactorTwo) {
    // 함정 — Clerk OTP 박스는 첫 input에 자동 포커스가 안 갈 수 있음.
    // 명시적으로 첫 input을 click/focus한 뒤 키 시퀀스 입력.
    // input[autocomplete="one-time-code"] = OTP input의 W3C 표준 속성.
    const otpInput = page.locator('input[autocomplete="one-time-code"]').first();
    await otpInput.waitFor({ state: 'visible', timeout: 5_000 });
    await otpInput.click();
    // delay — React onChange가 6개 셀로 분배할 시간을 줌 (너무 빠르면 일부만 반영)
    await page.keyboard.type('424242', { delay: 50 });

    // 자동 제출이 일반적이지만, 안 되면 formButtonPrimary 명시 클릭
    await page
      .locator('button[data-localization-key="formButtonPrimary"]')
      .click({ timeout: 3_000 })
      .catch(() => {});
  }

  // 로그인 성공 시 sign-in 경로 이탈 → 어떤 페이지로 갔든 OK
  // (NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/ 설정이지만, /가 미들웨어로 /camp-list 리다이렉트할 수도)
  await page.waitForURL(
    (url) => !url.pathname.startsWith('/sign-in') && !url.host.includes('accounts'),
    { timeout: 30_000 },
  );

  // storageState 저장 — 이 파일을 다른 인증 spec이 use.storageState로 재사용
  await page.context().storageState({ path: authFile });

  // 마지막 검증 — 쿠키에 Clerk 세션이 실제로 들어갔는지 가벼운 sanity check
  const cookies = await page.context().cookies();
  const hasClerkSession = cookies.some((c) => c.name.startsWith('__session') || c.name.startsWith('__client'));
  expect(hasClerkSession).toBe(true);
});
