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

- [Node.js](https://nodejs.org/) 22 ~ 24 (`nvm use`로 `.nvmrc` 적용)
- [pnpm](https://pnpm.io/) 10+
- [Docker](https://www.docker.com/) (PostgreSQL 컨테이너용, 클라우드 DB 사용 시 불필요)

> **주의**: Node 25+에서는 SSR `localStorage` 호환 문제가 있으므로 22 ~ 24를 사용하세요.

## 환경변수

`.env.example`을 복사하여 `.env.dev`를 생성하고, Clerk 인증 키를 채워넣습니다.

```bash
cp .env.example .env.dev
```

## 로컬 개발 환경

### 1) Docker로 실행 (권장)

모든 서비스(PostgreSQL + API + Web)를 한 번에 띄웁니다.

```bash
docker compose --env-file .env.dev --profile dev up -d
```

### 2) 호스트에서 직접 실행

Docker 없이 호스트에서 직접 실행하거나, 클라우드 DB에 연결하고 싶은 경우 사용합니다.
DB는 Docker로 로컬 PostgreSQL만 띄우거나, `.env.dev`에 클라우드 DB URL을 직접 설정합니다.
```bash
# 로컬 PostgreSQL만 필요한 경우
docker compose --env-file .env.dev --profile dev up postgres -d
```

```bash
nvm use                # Node 22 활성화
pnpm install           # 의존성 설치
pnpm dev:local         # .env.dev 기반으로 전체 서비스 실행
```

포트를 변경하고 싶다면 `.env.dev`에서 `WEB_PORT`, `API_PORT`를 수정하고, `CORS_ORIGIN`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL`도 함께 맞춰주세요.

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
