FROM node:22-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile || pnpm install

COPY . .

ENV NODE_ENV=production
ENV WS_PORT=8080
EXPOSE 8080

RUN pnpm build

CMD ["pnpm", "start"]