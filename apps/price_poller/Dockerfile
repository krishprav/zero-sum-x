# syntax=docker/dockerfile:1.6

FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat \
  && corepack enable && corepack prepare pnpm@9 --activate

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile
RUN pnpm prisma:generate

FROM deps AS build
COPY tsconfig.json ./
COPY src ./src
COPY seed.ts ./
RUN pnpm build

FROM node:20-alpine AS runtime
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat \
  && addgroup -S nodegrp && adduser -S nodeuser -G nodegrp
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

USER nodeuser
CMD ["node", "dist/index.js"]
