-- Prepared offline. Do not apply automatically. Existing compositions remain readable.
ALTER TABLE "CustomizationTemplate" ADD COLUMN "productType" TEXT NOT NULL DEFAULT 'UNCONFIGURED';
ALTER TABLE "CustomizationTemplate" ADD COLUMN "variantIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
-- IMPORTANT: classify existing templates as MUG or SHIRT before enabling the studio.
ALTER TABLE "StoredAsset" ADD COLUMN "pixelWidth" INTEGER, ADD COLUMN "pixelHeight" INTEGER;
CREATE TABLE "Artwork" (
 "id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL, "category" TEXT NOT NULL,
 "subcategory" TEXT NOT NULL DEFAULT '', "tags" TEXT[] NOT NULL, "compatibleTypes" TEXT[] NOT NULL,
 "originalAssetId" TEXT NOT NULL REFERENCES "StoredAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 "thumbnailAssetId" TEXT NOT NULL REFERENCES "StoredAsset"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 "origin" TEXT NOT NULL, "usageRights" TEXT NOT NULL, "active" BOOLEAN NOT NULL DEFAULT false,
 "revision" INTEGER NOT NULL DEFAULT 1, "preset" JSONB,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "Artwork_active_category_idx" ON "Artwork"("active", "category");

CREATE INDEX "Artwork_originalAssetId_idx" ON "Artwork"("originalAssetId");
