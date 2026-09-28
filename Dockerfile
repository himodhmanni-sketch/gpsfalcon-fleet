# ----------------------------------------------------
# Multi-stage Dockerfile for GPSWOX Enterprise Fleet Platform
# ----------------------------------------------------

# Stage 1: Build Frontend (Vite)
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./
RUN npm ci

# Copy source code and build frontend
COPY . .
RUN npm run build

# Stage 2: Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built frontend assets from builder stage
COPY --from=builder /app/dist ./dist

# Copy backend server and database scripts
COPY server ./server
COPY .env.example ./.env.example

# Expose ports:
# 3001: Web App, REST APIs & Live Telemetry WebSocket
# 5055: Traccar Client / OsmAnd HTTP protocol
# 5023: Concox GT06 GPS Hardware TCP protocol
# 5027: Teltonika Code 8 GPS Hardware TCP protocol
# 5001: Coban GPS103 GPS Hardware TCP protocol
EXPOSE 3001 5055 5023 5027 5001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/protocols || exit 1

# Start the full-stack GPS gateway & web server
CMD ["node", "server/gateway.js"]
