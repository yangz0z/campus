import { defineConfig, devices } from '@playwright/test';

// apps/web 브라우저 E2E 설정 (Step 6 — 비로그인 랜딩 MVP)
// - testDir: e2e/ (Next.js 라우트와 분리)
// - projects: Chromium + WebKit (Safari 엔진) — Firefox는 국내 사용률 낮아 생략
// - webServer: pnpm dev를 자동 기동, 이미 떠 있으면 재사용
// - trace/screenshot: 실패 시에만 캡처 (용량 절약)
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
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  // 환경변수는 package.json의 test:e2e 스크립트가 dotenv-cli로 주입한다.
  // 그 환경은 webServer 자식 프로세스로 상속되므로 여기선 단순히 pnpm dev만 호출.
  // (이전에 Clerk publishable key 누락으로 SSR에서 localStorage.getItem 에러 발생했던 함정 회피)
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3200',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
