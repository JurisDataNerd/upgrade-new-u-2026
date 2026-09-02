FROM oven/bun:1.3.11-alpine AS builder
WORKDIR /app

COPY package.json ./
RUN bun install --frozen-lockfile || bun install

COPY . .
RUN bun run build

FROM oven/bun:1.3.11-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV HOST=0.0.0.0

COPY --from=builder /app/.output /app/.output

EXPOSE 3001
CMD ["bun", "run", ".output/server/index.mjs"]
