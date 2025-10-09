FROM node:18-alpine

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package.json for this specific app
COPY package.json ./

# Install all dependencies (including dev for build)
RUN pnpm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN pnpm run build

# Install only production dependencies for runtime
RUN pnpm install --prod

# Expose port
EXPOSE 9090

# Start the application
CMD ["pnpm", "start"]