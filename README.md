# CampUs - 현명한 캠핑준비
https://camp-withus.com

캠핑에 필요한 모든 준비물을 체크할 수 있는 웹 애플리케이션입니다.

## 기술 스택

| 영역 | 기술 |
|------|------|
| Monorepo | TurboRepo + pnpm workspaces |
| Backend | Nest.js + TypeORM |
| Frontend | Next.js (App Router) |
| Database | PostgreSQL (로컬: Docker / 프로덕션: Neon) |
| Auth | Clerk |
| Infra | Docker Compose + Cloudflare Tunnel |

## 사전 준비

- [Node.js](https://nodejs.org/) 22+
- [pnpm](https://pnpm.io/) 10+
- [Docker](https://www.docker.com/) (Docker Compose 포함)

## 환경변수

프로젝트 루트에 `.env.dev` 파일을 생성합니다. Docker Compose가 이 파일에서 변수를 읽어 각 컨테이너에 주입합니다.
**.env 파일은 운영환경에서 사용합니다. 반드시 .env.dev로 하셔야 합니다.**

```env
# Clerk 인증
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-in
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/mypage
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/mypage

# 프로덕션 도메인
CORS_ORIGIN=https://camp-withus.com
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=https://api.camp-withus.com
```

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `DATABASE_URL` | PostgreSQL 연결 URL (프로덕션) | - |
| `POSTGRES_USER` | 로컬 DB 사용자 | `campus` |
| `POSTGRES_PASSWORD` | 로컬 DB 비밀번호 | `campus` |
| `POSTGRES_DB` | 로컬 DB 이름 | `campus` |
| `CLERK_SECRET_KEY` | Clerk 시크릿 키 | - |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk 퍼블릭 키 | - |
| `CORS_ORIGIN` | API CORS 허용 도메인 | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | API 서버 URL (SSR용) | `http://localhost:4000` |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL (브라우저용) | `http://localhost:4000` |

## 로컬 개발 환경

### Docker로 실행 (권장)

모든 서비스(PostgreSQL + API + Web)를 한 번에 띄웁니다.

먼저 프로젝트 루트에 `.env.dev` 파일을 생성하고 Clerk 인증 키를 설정합니다.

```env
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
```

```bash
docker compose --env-file .env.dev --profile dev up -d
```

| 서비스 | URL | 설명 |
|--------|-----|------|
| API | http://localhost:4000 | Nest.js (hot reload) |
| Web | http://localhost:3000 | Next.js (hot reload) |
| PostgreSQL | localhost:5432 | DB (user: campus / pw: campus) |

#### DB만 Docker로 띄우고 호스트에서 직접 개발

```bash
# PostgreSQL 컨테이너만 실행
docker compose --env-file .env.dev --profile dev up postgres

# 호스트에서 의존성 설치 및 개발 서버 실행
pnpm install
pnpm dev
```

이 경우 `.env.dev` 파일에 로컬 DB 연결 정보를 설정해야 합니다.

```env
DATABASE_URL=postgresql://campus:campus@localhost:5432/campus
```

### Docker 없이 실행

별도의 PostgreSQL이 필요합니다.

```bash
# 환경변수 설정 (.env 파일 생성 후 DB 및 Clerk 정보 입력)
# DATABASE_URL, CLERK_SECRET_KEY, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY 설정

# 의존성 설치 및 실행
pnpm install
pnpm dev
```

개별 앱만 실행하려면:

```bash
pnpm dev --filter api   # 백엔드만
pnpm dev --filter web   # 프론트엔드만
```

## 프로덕션 환경

### 환경변수 설정

`.env` 파일에 Neon PostgreSQL 연결 정보와 Clerk 인증 키를 설정합니다.

### 빌드 및 실행

```bash
docker compose --profile prod up --build -d
```

| 서비스 | URL | 설명 |
|--------|-----|------|
| API | http://localhost:4000 | 멀티스테이지 빌드 이미지 |
| Web | http://localhost:3000 | Next.js standalone 이미지 |

### 개별 빌드

```bash
docker compose --profile prod build api   # API만 빌드
docker compose --profile prod build web   # Web만 빌드
```

### Cloudflare Tunnel

`cloudflared`를 통해 외부에 노출합니다.

```bash
cloudflared tunnel run campus
```

| 도메인 | 서비스 |
|--------|--------|
| camp-withus.com | Web (localhost:3000) |
| api.camp-withus.com | API (localhost:4000) |

## 프로젝트 구조

```
campus/
├── apps/
│   ├── api/                  # Nest.js 백엔드
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── app.controller.ts
│   │   │   ├── app.service.ts
│   │   │   └── config/
│   │   │       └── database.config.ts
│   │   └── Dockerfile
│   └── web/                  # Next.js 프론트엔드
│       ├── src/app/
│       │   ├── layout.tsx
│       │   └── page.tsx
│       └── Dockerfile
├── packages/
│   ├── shared/               # 공유 타입/유틸
│   ├── typescript-config/    # 공유 TypeScript 설정
│   └── eslint-config/        # 공유 ESLint 설정
├── docker-compose.yml        # dev/prod profiles 통합
├── turbo.json
├── pnpm-workspace.yaml
└── .env                      # 환경변수 (직접 생성)
```
