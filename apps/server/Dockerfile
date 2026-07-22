FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lock ./
COPY apps/server/package.json ./apps/server/
COPY apps/pwa/package.json ./apps/pwa/

RUN bun install

COPY . .

ENV PATH="/app/node_modules/.bin:${PATH}"

WORKDIR /app/apps/server

EXPOSE 3001

CMD ["bun", "run", "index.ts"]
