# 1. Build Next.js
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# 2. Production runner with Caddy
FROM caddy:2-alpine AS runner

# Копируем билд Next.js
COPY --from=builder /app/.next /app/.next
COPY --from=builder /app/public /app/public
COPY --from=builder /app/package*.json /app/

# Устанавливаем Node для запуска Next.js
RUN apk add --no-cache nodejs npm

WORKDIR /app
RUN npm install --production --legacy-peer-deps

# Копируем Caddyfile
COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 80 443
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
