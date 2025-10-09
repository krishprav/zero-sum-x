FROM node:18-alpine

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy root package files for workspace setup
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy price_poller package.json
COPY apps/price_poller/package.json ./apps/price_poller/

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile --prod

# Copy source code
COPY apps/price_poller ./apps/price_poller

# Build the application
RUN cd apps/price_poller && pnpm run build

# Expose port
EXPOSE 9090

# Start the application
WORKDIR /app/apps/price_poller
CMD ["pnpm", "start"]