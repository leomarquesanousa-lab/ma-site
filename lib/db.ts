import { PrismaClient } from "@prisma/client";
import { createHash } from "node:crypto";
import { assertLocalDatabaseUrl } from "@/scripts/local-db-target.cjs";
import { secureNeonUrl } from "@/lib/commerce/neon";
import { loadProjectEnv } from "@/scripts/project-env.cjs";

loadProjectEnv();
const localDevelopment = process.env.NODE_ENV !== "production" || process.env.MA_RUNTIME !== "production";
const homologation = process.env.MA_HOMOLOGATION === "1" && process.env.MA_RUNTIME === "homologation";
const databaseUrl = homologation
  ? secureNeonUrl(process.env.DATABASE_URL)
  : localDevelopment
  ? assertLocalDatabaseUrl(process.env.DATABASE_URL)
  : secureNeonUrl(process.env.DATABASE_URL);
const localTarget = localDevelopment
  ? createHash("sha256").update(databaseUrl).digest("hex")
  : undefined;

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  localTarget?: string;
};

export const db =
  (localDevelopment && globalForPrisma.localTarget === localTarget
    ? globalForPrisma.prisma
    : undefined) ??
  new PrismaClient({ datasources: { db: { url: databaseUrl } } });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
  globalForPrisma.localTarget = localTarget;
}
