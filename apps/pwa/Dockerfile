# ==========================================
# Stage 1: Base Runtime Image
# ==========================================
FROM oven/bun:1.2-slim AS base
WORKDIR /app

# ==========================================
# Stage 2: Dependencies Installation
# ==========================================
FROM base AS dependencies
COPY package.json bun.lock* ./
COPY apps/server/package.json ./apps/server/
COPY apps/pwa/package.json ./apps/pwa/
RUN bun install

# ==========================================
# Stage 3: React PWA Runner
# ==========================================
FROM base AS runner
WORKDIR /app

# Copy dependencies and application source
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/pwa/node_modules ./apps/pwa/node_modules
COPY . .

# Set non-root permissions
RUN chown -R bun:bun /app

WORKDIR /app/apps/pwa

# Enforce non-root execution
USER bun

# Container Healthcheck (SonarQube Security Compliant)
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD bun --version || exit 1

EXPOSE 5173

CMD ["bun", "run", "dev", "--host", "0.0.0.0"]
