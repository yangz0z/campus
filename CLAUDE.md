# CLAUDE.md

## 프로젝트 개요

- pnpm workspace + Turbo 모노레포
- `apps/api` — NestJS 11 + TypeORM + PostgreSQL (포트 4100)
- `apps/web` — Next.js 15 App Router + React 19 + Tailwind CSS 4 (포트 3200)
- `packages/shared` — 공유 타입/유틸 (`@campus/shared`)
- 인증: Clerk (글로벌 가드 `ClerkAuthGuard`)
- 실시간: Socket.IO (`apps/api/src/modules/camp/camp.gateway.ts`)

## 워크스페이스 명령어

- `pnpm dev` — Turbo watch, api + web 동시 기동
- `pnpm build` — 전체 빌드
- `pnpm lint` — 워크스페이스 전체 린트
- API 마이그레이션: `apps/api` 내부에서 TypeORM CLI 사용

## 코드 컨벤션

- `else` 사용 금지 → early return 패턴 사용
- 삼항 연산자 사용 금지
- `switch` 문 사용 금지 → 객체 맵 또는 early return 사용
- 함수는 단일 책임 원칙 준수
- 타입은 명시적으로 선언
- `any` 사용 금지
- default export 대신 named export 사용
- 높은 응집도와 낮은 결합도를 준수
- 백엔드 파일명: kebab-case + `.controller.ts` / `.service.ts` / `.module.ts` / `.entity.ts` / `.dto.ts` 접미사
- 프론트엔드 컴포넌트 파일명: PascalCase
- DB 컬럼명: snake_case (TypeORM 엔티티 기준)

## 아키텍처 원칙

- `shared`에는 유틸 함수만 존재. 프로젝트는 `shared`만 import
- NestJS 모듈 소유권 분리: 엔티티의 Repository는 해당 엔티티를 소유한 모듈의 Service에서만 접근. 다른 모듈은 Service를 통해서만 데이터 접근 (예: AuthModule → UserService 호출, UserRepository 직접 접근 금지)
- 인증 경계: 모든 엔드포인트는 글로벌 `ClerkAuthGuard`로 보호. 공개 엔드포인트만 `@Public()` 데코레이터를 명시적으로 부여. 컨트롤러는 `@CurrentUser()`로 resolve된 `User` 엔티티를 받음 (참고: `apps/api/src/modules/auth/`)
- 프론트엔드 데이터 접근: 모든 변이는 `apps/web/src/actions/*.ts` 서버 액션으로 일원화. 클라이언트는 `useAction()` 훅으로 래핑하여 에러/토스트 처리. GET은 `serverFetch` / `serverFetchCached`, 변이 후 `revalidatePath()`로 캐시 무효화 (참고: `apps/web/src/lib/api-server.ts`, `apps/web/src/hooks/useAction.ts`)
- 공유 타입은 단방향 흐름: `api`/`web` ← `@campus/shared`. `shared`는 런타임 의존성 없이 타입과 도메인 enum만 보유 (참고: `packages/shared/src/types/`)

## 상세 규칙 참조

공통 TS/JS 규칙은 `.claude/rules/coding-style.md`, `.claude/rules/security.md`, `.claude/rules/patterns.md`, `.claude/rules/hooks.md`, 프론트엔드 전용 규칙은 `.claude/rules/web/*.md` 참조.
