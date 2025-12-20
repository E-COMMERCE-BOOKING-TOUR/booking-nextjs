# ==================================
# Dependencies Stage
# ==================================
FROM node:24.11.1-slim AS deps

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# ==================================
# Build Stage
# ==================================
FROM node:24.11.1-slim AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application files
COPY . .

# Build the Next.js application
RUN npm run build

# ==================================
# Production Stage
# ==================================
FROM node:24.11.1-slim AS production

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user for security
RUN groupadd -r --gid 1001 nodejs && \
    useradd -r --uid 1001 --gid nodejs --shell /bin/bash nextjs

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy necessary config files (only if they exist in the build)
COPY --chown=nextjs:nodejs next.config.ts ./
COPY --chown=nextjs:nodejs tsconfig.json ./

# Switch to non-root user
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application using npm start
CMD ["npm", "start"]

# ==================================
# Development Stage
# ==================================
FROM node:24.11.1-slim AS development

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
