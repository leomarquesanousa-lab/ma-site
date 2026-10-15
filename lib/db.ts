import { PrismaClient } from "@prisma/client";
import { createHash } from "node:crypto";
import { assertLocalDatabaseUrl } from "@/scripts/local-db-target.cjs";

const localDevelopment = process.env.NODE_ENV !== "production";
const localTarget = localDevelopment
  ? createHash("sha256").update(assertLocalDatabaseUrl(process.env.DATABASE_URL)).digest("hex")
  : undefined;

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  localTarget?: string;
};

export const db =
  (localDevelopment && globalForPrisma.localTarget === localTarget
    ? globalForPrisma.prisma
    : undefined) ??
  new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
  globalForPrisma.localTarget = localTarget;
}
