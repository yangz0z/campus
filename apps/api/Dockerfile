FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.29.3 --activate
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN pnpm add -g turbo@^2.4.0
WORKDIR /app

# --- prune: extract api and its dependencies ---
FROM base AS pruner
COPY . .
RUN turbo prune api --docker

# --- deps: install dependencies ---
FROM base AS deps
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

# --- build ---
FROM base AS builder
COPY --from=deps /app/ .
COPY --from=pruner /app/out/full/ .
RUN pnpm build --filter api

# --- runner ---
FROM node:22-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nestjs && \
    adduser --system --uid 1001 nestjs

COPY --from=builder --chown=nestjs:nestjs /app/ .

USER nestjs
EXPOSE 4000
ENV NODE_ENV=production
CMD ["node", "apps/api/dist/main"]
