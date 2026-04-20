import { defineConfig } from 'vitest/config';
import swc from 'unplugin-swc';

// NestJS 데코레이터(@Injectable, @InjectRepository, @Entity 등) 처리:
// - SWC가 TS → JS 변환 + decorator metadata emit
// - setupFiles로 reflect-metadata polyfill 로드
export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['src/**/*.test.ts'],
    setupFiles: ['./test/setup.ts'],
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});
