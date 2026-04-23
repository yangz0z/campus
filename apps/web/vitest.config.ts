import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// apps/web 컴포넌트 테스트 전용 설정:
// - environment: 'jsdom' — Node 안에 브라우저 DOM API (document, window) 제공
// - @vitejs/plugin-react — React 19 JSX transform 및 HMR 없이 JSX 컴파일
// - resolve.alias — Next.js tsconfig의 "@/*": "./src/*"를 Vitest에서도 재현
// - setupFiles — @testing-library/jest-dom matcher를 expect에 확장 등록
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
