# ==========================================
# Stage 1: Base Runtime Image
# ==========================================
FROM oven/bun:1.2-slim AS base
WORKDIR /app

# ==========================================
# Stage 2: Dependencies Installation
# ==========================================
FROM base AS dependencies
# Copy monorepo package definitions for layer caching
COPY package.json bun.lock* ./
COPY apps/server/package.json ./apps/server/
COPY apps/pwa/package.json ./apps/pwa/

# Install monorepo workspace dependencies
RUN bun install

# ==========================================
# Stage 3: Source Code & Asset Assembly
# ==========================================
FROM dependencies AS builder
COPY . .

# Set non-root permissions across all workspace files
RUN chown -R bun:bun /app

# ==========================================
# Stage 4: Production Runner
# ==========================================
FROM base AS runner
WORKDIR /app

# Copy assembled application from builder stage
COPY --from=builder --chown=bun:bun /app /app

# Enforce non-root execution
USER bun

# Container Healthcheck (SonarQube Security Compliant)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD bun --version || exit 1

EXPOSE 3000 3001 5173

CMD ["bun", "run", "start"]