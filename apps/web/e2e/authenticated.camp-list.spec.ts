// 인증된 사용자 시나리오 — Step 6.5a:
// - playwright.config.ts의 'chromium-authenticated' project가 이 파일을 실행
// - storageState 재사용 → 매 테스트마다 다시 로그인하지 않음
// - 검증 대상: 보호 라우트 진입이 sign-in으로 리다이렉트되지 않는다는 것
//   (Clerk 인증 미들웨어가 실제로 통과한다는 증거)
import { test, expect } from '@playwright/test';

test.describe('인증된 사용자 — 보호 라우트', () => {
  test('/camp-list 접근 시 sign-in으로 redirect되지 않고 페이지가 정상 로드된다', async ({ page }) => {
    // Act
    await page.goto('/camp-list');

    // Assert — sign-in으로 우회되지 않음 (= Clerk 미들웨어 통과)
    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page).toHaveURL(/\/camp-list/);

    // 페이지의 핵심 콘텐츠가 가시화 (빈 상태든 캠프 목록이든)
    // — getByRole('main')은 layout + 페이지 두 개라 strict mode violation 발생
    // — 페이지 고유 텍스트 매칭으로 회피 (빈 상태 또는 캠프 헤딩 둘 다 포함)
    await expect(
      page.getByText(/내 캠프|아직 캠프가 없어요/).first(),
    ).toBeVisible();
  });

  test('/camp/new 접근도 인증 통과', async ({ page }) => {
    await page.goto('/camp/new');

    await expect(page).not.toHaveURL(/\/sign-in/);
    await expect(page).toHaveURL(/\/camp\/new/);
  });
});
