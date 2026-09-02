# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install all dependencies (including dev)
RUN npm ci

# Copy backend source code
COPY backend/ .

# Stage 2: Production
FROM node:20-alpine AS production

# Set environment
ENV NODE_ENV=production

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files
COPY backend/package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source from builder
COPY --from=builder /app/src ./src
COPY --from=builder /app/server.js ./server.js

# Create logs directory
RUN mkdir -p logs && chown -R nodejs:nodejs logs

# Switch to non-root user
USER nodejs

# Expose port (Render overrides this via $PORT env var at runtime)
EXPOSE 4000

# Health check — uses $PORT so it works on Render and locally
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "const port = process.env.PORT || 4000; require('http').get('http://0.0.0.0:' + port + '/api/v1/health/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start application
CMD ["node", "server.js"]