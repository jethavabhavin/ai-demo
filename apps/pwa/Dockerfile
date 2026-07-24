FROM oven/bun:1

WORKDIR /app

COPY package.json bun.lock ./
COPY apps/server/package.json ./apps/server/
COPY apps/pwa/package.json ./apps/pwa/

RUN bun install

COPY . .

ENV PATH="/app/node_modules/.bin:/app/apps/pwa/node_modules/.bin:${PATH}"

WORKDIR /app/apps/pwa

EXPOSE 5173

CMD ["bun", "run", "dev", "--host", "0.0.0.0"]
