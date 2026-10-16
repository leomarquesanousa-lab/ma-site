import { defineConfig } from "prisma/config";
import { assertLocalDatabaseUrl } from "./scripts/local-db-target.cjs";
import { loadLocalDatabaseUrl } from "./scripts/local-env.cjs";
import { loadProjectEnv } from "./scripts/project-env.cjs";

// Load only .env and fail closed before Prisma CLI can use a remote database.
// Shell overrides and .env.local never select the migration target.
// Client generation only reads the schema and writes local generated files.
// All database commands retain the original local-target restriction.
process.env.DATABASE_URL = process.argv[2] === "generate"
  ? loadProjectEnv().DATABASE_URL
  : assertLocalDatabaseUrl(loadLocalDatabaseUrl());
process.env.DIRECT_URL = "";
process.env.SHADOW_DATABASE_URL = "";
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
});
