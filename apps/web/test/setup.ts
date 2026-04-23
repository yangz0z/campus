// @testing-library/jest-dom의 matcher(toBeInTheDocument, toHaveClass 등)를
// Vitest의 expect에 확장 등록.
import '@testing-library/jest-dom/vitest';

// globals: false 설정이라 RTL이 자동 cleanup을 등록하지 못한다.
// 매 테스트 후 DOM을 비워야 이전 render()의 결과가 다음 테스트로 누수되지 않는다.
// (globals: true였다면 RTL이 vitest globals를 감지해 자동으로 afterEach(cleanup) 등록)
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
