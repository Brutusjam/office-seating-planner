/**
 * REQ: OFP-TECH-007
 * PrismaClient-Singleton für den Office Seating Planner (Prisma 7 + SQLite-Adapter).
 */
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});

export const prisma: PrismaClient =
  global.prisma ?? new PrismaClient({ adapter, log: ["error", "warn"] });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
