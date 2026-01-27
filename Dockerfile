##
# REQ: OFP-TECH-008, OFP-DEP-001, OFP-DEP-002
# Mehrstufiges Dockerfile für Next.js + Prisma + SQLite mit persistentem Volume.
##

FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# SQLite-Volume
VOLUME ["/data"]

COPY --from=builder /app/package.json /app/package-lock.json* ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# SQLite-DB Pfad auf Volume zeigen
ENV DATABASE_URL="file:/data/dev.db"

EXPOSE 3000

CMD ["npm", "run", "start"]

