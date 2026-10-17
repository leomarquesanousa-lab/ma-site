-- Prepared only. Requires separate authorization before applying in any environment.
BEGIN;
CREATE TABLE "public"."HomeContent" (
  "id" TEXT NOT NULL DEFAULT 'home',
  "banners" JSONB NOT NULL,
  "revision" INTEGER NOT NULL DEFAULT 1,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HomeContent_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "HomeContent_singleton" CHECK ("id" = 'home'),
  CONSTRAINT "HomeContent_banner_limit" CHECK (jsonb_typeof("banners") = 'array' AND jsonb_array_length("banners") <= 10),
  CONSTRAINT "HomeContent_revision_positive" CHECK ("revision" > 0)
);
COMMIT;
