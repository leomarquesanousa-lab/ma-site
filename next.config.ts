import type { NextConfig } from "next";
import { installNextEnv } from "./scripts/next-env.cjs";
import { assertLocalDatabaseUrl } from "./scripts/local-db-target.cjs";
import { secureNeonUrl } from "./lib/commerce/neon";

installNextEnv();
if (process.env.MA_HOMOLOGATION === "1" && process.env.MA_RUNTIME === "homologation") secureNeonUrl(process.env.DATABASE_URL);
else if (process.env.NODE_ENV !== "production" || process.env.MA_RUNTIME !== "production") assertLocalDatabaseUrl(process.env.DATABASE_URL);
else secureNeonUrl(process.env.DATABASE_URL);

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.104"],
};

export default nextConfig;
