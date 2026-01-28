##
# REQ: OFP-TECH-008, OFP-DEP-001, OFP-DEP-002
# Mehrstufiges Dockerfile für Next.js + Prisma + SQLite mit persistentem Volume.
##

FROM node:22-alpine AS builder
WORKDIR /app

# DATABASE_URL wird für prisma generate benötigt (Dummy-Wert für Build)
ENV DATABASE_URL="file:/tmp/build.db"

COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

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
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/scripts ./scripts
# CRLF → LF (Windows), damit #!/bin/sh funktioniert
RUN sed -i 's/\r$//' /app/scripts/start.sh && chmod +x /app/scripts/start.sh

# SQLite-DB Pfad auf Volume zeigen
ENV DATABASE_URL="file:/data/dev.db"

EXPOSE 3000

CMD ["/app/scripts/start.sh"]

