#!/bin/sh
set -e

# Prisma-Migrationen vor App-Start (DB-Tabellen anlegen).
# Speicherlimit nur für Migrate, reduziert OOM-Risiko auf kleinen VMs.
NODE_OPTIONS="--max-old-space-size=256" npx prisma migrate deploy

# Next.js auf 0.0.0.0 hören lassen (Fly Proxy).
export HOSTNAME=0.0.0.0
exec node node_modules/next/dist/bin/next start
