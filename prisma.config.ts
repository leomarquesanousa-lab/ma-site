import { defineConfig } from "prisma/config";
import { assertLocalDatabaseUrl } from "./scripts/local-db-target.cjs";
import { loadLocalDatabaseUrl } from "./scripts/local-env.cjs";

// Fail closed before Prisma CLI can load the original .env or use a remote database.
// An explicitly supplied URL (e.g. the protected initializer) must also be local.
process.env.DATABASE_URL = assertLocalDatabaseUrl(process.env.DATABASE_URL || loadLocalDatabaseUrl());
process.env.DIRECT_URL = "";
process.env.SHADOW_DATABASE_URL = "";
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
});
