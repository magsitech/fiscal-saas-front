# Dockerfile — fiscal-saas-front
# Build estático servido por Nginx

# ── Stage 1: build ─────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json .
RUN npm install

COPY . .
RUN npm run build

# ── Stage 2: serve ─────────────────────────────────────────
FROM nginx:1.27-alpine

# Config nginx com SPA fallback e proxy para a API
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
