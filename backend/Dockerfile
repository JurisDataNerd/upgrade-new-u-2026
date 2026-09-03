FROM oven/bun:1.3.11-alpine AS base
WORKDIR /app

# Install dependencies
COPY package.json ./
RUN bun install --frozen-lockfile || bun install

# Copy source
COPY . .

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

CMD ["bun", "run", "src/index.ts"]
