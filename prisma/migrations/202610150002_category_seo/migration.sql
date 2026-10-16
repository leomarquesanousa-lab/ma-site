-- Prepared for the authorized homologation branch only. Not applied automatically.
BEGIN;
ALTER TABLE "public"."Category"
  ADD COLUMN "seoTitle" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "seoDescription" TEXT NOT NULL DEFAULT '';
COMMIT;
