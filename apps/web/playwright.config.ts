import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

// apps/web 브라우저 E2E 설정
// - Step 6  : 비로그인 랜딩 MVP (Chromium + WebKit)
// - Step 6.5a: Clerk 로그인 자동화 + storageState 재사용
//
// Project dependencies 패턴:
//   setup → chromium-authenticated (storageState 재사용)
//   비로그인 chromium/webkit는 setup 없이 독립 실행
//
// storageState 파일 위치: playwright/.auth/user.json (.gitignore 처리됨)
const STORAGE_STATE = path.join(__dirname, 'playwright/.auth/user.json');

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: process.env.WEB_BASE_URL ?? 'http://localhost:3200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },
  projects: [
    // ── 인증 setup project (다른 프로젝트의 dependency) ──
    // auth.setup.ts만 실행하여 Clerk 로그인 후 storageState 저장
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    // ── 비로그인 시나리오 (Step 6 landing) ──
    // setup 의존 없음, storageState 미사용
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /authenticated\..*\.spec\.ts/,
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: /authenticated\..*\.spec\.ts/,
    },
    // ── 인증된 시나리오 (Step 6.5a) ──
    // setup이 만든 storageState 재사용 — 매 테스트마다 로그인 안 함
    // Chromium만 사용 (인증 후 흐름은 브라우저 무관)
    {
      name: 'chromium-authenticated',
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE,
      },
      testMatch: /authenticated\..*\.spec\.ts/,
      dependencies: ['setup'],
    },
  ],
  // 환경변수는 package.json의 test:e2e 스크립트가 dotenv-cli로 주입.
  // E2E_CLERK_USER_EMAIL/PASSWORD도 같은 경로로 자식 프로세스에 상속됨.
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3200',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
