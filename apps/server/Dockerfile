FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lock* ./
COPY apps/server/package.json ./apps/server/
COPY apps/pwa/package.json ./apps/pwa/

RUN bun install

COPY . .

WORKDIR /app/apps/server

# Run bun install inside apps/server as well to ensure local workspace links are satisfied
# RUN bun install

EXPOSE 3001

CMD ["bun", "run", "index.ts"]
