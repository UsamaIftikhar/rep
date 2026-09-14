import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Always instantiate new PrismaClient in dev HMR when schema updates to prevent stale global state
export const db =
  (process.env.NODE_ENV === "development" ? null : globalForPrisma.prisma) ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

