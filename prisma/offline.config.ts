import { defineConfig } from "prisma/config";
// Use only for offline schema validation/client generation. Does not load .env files.
export default defineConfig({ schema: "schema.prisma" });
