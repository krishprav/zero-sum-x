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
EXPOSE 9090

# Start the application
CMD ["pnpm", "start"]