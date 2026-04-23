import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

// E2E 전용 Vitest 설정:
// - include 패턴을 test/**/*.e2e-spec.ts로 한정하여 유닛(src/**/*.spec.ts)과 분리
// - setupFiles는 유닛과 동일하게 reflect-metadata polyfill 재사용
// - app.init/close 같은 라이프사이클이 돌기 때문에 기본 5s 타임아웃을 10s로 완화
export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['test/**/*.e2e-spec.ts'],
    setupFiles: ['./test/setup.ts'],
    testTimeout: 10_000,
    // Testcontainers가 Docker 이미지를 처음 받을 때 30~60초 걸릴 수 있어
    // beforeAll/afterAll 훅 타임아웃을 넉넉히 둔다.
    hookTimeout: 120_000,
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});
