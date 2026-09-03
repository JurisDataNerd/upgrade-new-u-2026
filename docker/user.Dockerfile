FROM oven/bun:1.3-alpine AS build
WORKDIR /app

# Copy root workspace configs
COPY package.json bun.lock tsconfig.base.json ./
COPY packages/ ./packages/
COPY frontend/user/ ./frontend/user/

# Install dependencies and build Vite app
RUN bun install --frozen-lockfile
WORKDIR /app/frontend/user
RUN bun run build

FROM nginx:alpine AS runner
COPY --from=build /app/frontend/user/dist /usr/share/nginx/html
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
