FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.29.3 --activate
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN pnpm add -g turbo@^2.4.0
WORKDIR /app

# --- prune: extract web and its dependencies ---
FROM base AS pruner
COPY . .
RUN turbo prune web --docker

# --- deps: install dependencies ---
FROM base AS deps
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

# --- build ---
FROM base AS builder
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_CLERK_SIGN_IN_URL
ARG NEXT_PUBLIC_CLERK_SIGN_UP_URL
ARG NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
ARG NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
COPY --from=deps /app/ .
COPY --from=pruner /app/out/full/ .
RUN pnpm build --filter web

# --- runner ---
FROM node:22-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nextjs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nextjs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nextjs /app/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3000
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
CMD ["node", "apps/web/server.js"]
