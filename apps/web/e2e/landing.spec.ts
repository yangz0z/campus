// 비로그인 랜딩 골든 패스 E2E (Step 6 — 옵션 A)
// - 실제 Chromium/WebKit에서 Next.js dev 서버를 띄워 검증
// - 인증이 필요 없는 경로만 — Clerk 통합은 Step 6.5에서
// - role/label/text 기반 쿼리 우선 (CSS 클래스 의존 금지)
import { test, expect } from '@playwright/test';

test.describe('Landing Page (비로그인)', () => {
  test('홈 페이지가 로드되고 Hero 헤드라인이 보인다', async ({ page }) => {
    // Arrange - Act
    await page.goto('/');

    // Assert — 대표 h1 (Hero 헤드라인)
    // "캠핑 준비,\n빠짐없이 챙기세요" — 줄바꿈과 span 때문에 부분 매칭
    await expect(page.getByRole('heading', { level: 1 })).toContainText('캠핑 준비');
  });

  test('랜딩의 주요 섹션이 스크롤 가능하게 렌더된다', async ({ page }) => {
    await page.goto('/');

    // FeatureSection 대표 타이틀 (Step 5 컴포넌트 테스트에서 이미 문자열 확인)
    await expect(page.getByText('스마트 체크리스트')).toBeVisible();

    // CtaSection의 h2 (마지막 섹션까지 렌더됨)
    await expect(
      page.getByRole('heading', { name: /준비는 끝났어요/ }),
    ).toBeVisible();
  });

  test('"무료로 시작하기" CTA 클릭 시 /sign-in으로 이동', async ({ page }) => {
    // Arrange
    await page.goto('/');

    // Act — Hero/CtaSection 중 첫 번째 CTA 링크 클릭 (둘 다 /sign-in으로 이동)
    await page.getByRole('link', { name: /무료로 시작하기/ }).first().click();

    // Assert
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('비로그인 상태로 /camp-list 접근 시 sign-in 경로로 redirect', async ({ page }) => {
    // Clerk middleware가 보호하는 라우트 → Clerk 인증 페이지로 리다이렉트
    await page.goto('/camp-list');

    // Clerk은 자체 호스트(account.*.clerk.accounts.dev 등) 또는 로컬 /sign-in으로 보낼 수 있어
    // URL 패턴을 느슨하게 매칭한다.
    await expect(page).toHaveURL(/sign-in|accounts\.dev|clerk/i);
  });
});
