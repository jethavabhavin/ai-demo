# syntax=docker/dockerfile:1
# ==========================================
# Stage 1: Base Runtime Image
# ==========================================
FROM oven/bun:1.2-slim AS base
WORKDIR /app
RUN mkdir -p /app && chown -R bun:bun /app

# ==========================================
# Stage 2: Dependencies Installation
# ==========================================
FROM base AS dependencies
COPY --chown=bun:bun package.json bun.lock* ./
COPY --chown=bun:bun apps/server/package.json ./apps/server/
COPY --chown=bun:bun apps/pwa/package.json ./apps/pwa/

RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile || bun install

# ==========================================
# Stage 3: Fastify Server Runner
# ==========================================
FROM base AS runner
WORKDIR /app

COPY --from=dependencies --chown=bun:bun /app/node_modules ./node_modules
COPY --from=dependencies --chown=bun:bun /app/apps/server/node_modules ./apps/server/node_modules
COPY --chown=bun:bun . .

WORKDIR /app/apps/server

USER bun

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD bun --version || exit 1

EXPOSE 3001

CMD ["bun", "run", "index.ts"]
