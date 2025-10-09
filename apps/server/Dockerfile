FROM node:18-alpine

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy root package files for workspace setup
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy server package.json
COPY apps/server/package.json ./apps/server/

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile --prod

# Copy source code
COPY apps/server ./apps/server

# Build the application
RUN cd apps/server && pnpm run build

# Expose port
EXPOSE 10000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:10000/health || exit 1

# Start the application
WORKDIR /app/apps/server
CMD ["pnpm", "start"]