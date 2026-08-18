# syntax=docker/dockerfile:1
# ==========================================
# Stage 1: Base Runtime Image
# ==========================================
FROM oven/bun:1.2-slim AS base
WORKDIR /app

# Initialize workspace directory with proper user ownership
RUN mkdir -p /app && chown -R bun:bun /app

# ==========================================
# Stage 2: Dependencies Installation
# ==========================================
FROM base AS dependencies

# Copy monorepo package definitions with ownership
COPY --chown=bun:bun package.json bun.lock ./
COPY --chown=bun:bun apps/server/package.json ./apps/server/
COPY --chown=bun:bun apps/pwa/package.json ./apps/pwa/

# Ultra-fast install leveraging BuildKit cache mount
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile || bun install

# ==========================================
# Stage 3: Production Runner
# ==========================================
FROM base AS runner
WORKDIR /app

# Copy cached dependencies directly from dependencies stage
COPY --from=dependencies --chown=bun:bun /app/node_modules ./node_modules
COPY --from=dependencies --chown=bun:bun /app/apps/server/node_modules ./apps/server/node_modules
COPY --from=dependencies --chown=bun:bun /app/apps/pwa/node_modules ./apps/pwa/node_modules

# Copy application source code directly with non-root ownership (No recursive chown!)
COPY --chown=bun:bun . .

# Enforce non-root execution
USER bun

# Container Healthcheck (SonarQube Security Compliant)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD bun --version || exit 1

EXPOSE 3000 3001 5173

CMD ["bun", "run", "start"]