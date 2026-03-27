FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.29.3 --activate
WORKDIR /app

# --- prune: extract api and its dependencies ---
FROM base AS pruner
RUN pnpm add -g turbo@^2.4.0
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

COPY --from=builder --chown=nestjs:nestjs /app/apps/api/dist ./dist
COPY --from=builder --chown=nestjs:nestjs /app/apps/api/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nestjs /app/apps/api/package.json ./package.json

USER nestjs
EXPOSE 4000
ENV NODE_ENV=production
CMD ["node", "dist/main"]
