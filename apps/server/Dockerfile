FROM node:18-alpine

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package.json for this specific app
COPY package.json ./

# Install dependencies
RUN pnpm install --prod

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Expose port
EXPOSE 10000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:10000/health || exit 1

# Start the application
CMD ["pnpm", "start"]