# Dockerfile
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies first (better layer caching — only reruns if package.json changes)
COPY package.json bun.lock* ./
COPY apps/server/package.json ./apps/server/
COPY apps/pwa/package.json ./apps/pwa/
RUN bun install

# Copy the rest of the source
COPY . .

# If you're using TypeScript compiled output, build it here
# RUN bun run build

EXPOSE 3000

CMD ["bun", "run", "start"]