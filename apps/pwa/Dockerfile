FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lock* ./
COPY apps/server/package.json ./apps/server/
COPY apps/pwa/package.json ./apps/pwa/

RUN bun install

COPY . .

WORKDIR /app/apps/pwa

# Run bun install inside apps/pwa as well to ensure local workspace links are satisfied
# RUN bun install

EXPOSE 5173

CMD ["bun", "run", "dev", "--host", "0.0.0.0"]
