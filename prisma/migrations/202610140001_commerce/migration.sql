-- Additive commerce migration. Review against the actual database before applying.
-- Does not create, alter or drop the existing User and Session tables.

CREATE TYPE "CommercialMode" AS ENUM ('QUOTE_ONLY', 'CUSTOMIZABLE', 'READY_TO_SELL');
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PRODUCTION', 'SHIPPED', 'DELIVERED', 'CANCELLED');
CREATE TYPE "QuoteStatus" AS ENUM ('NEW', 'REVIEWING', 'PROPOSED', 'ACCEPTED', 'REJECTED');

CREATE TABLE "Category" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "imageUrl" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "position" INTEGER NOT NULL DEFAULT 0,
  "parentId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

CREATE TABLE "Product" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "sku" TEXT NOT NULL,
  "shortDescription" TEXT NOT NULL DEFAULT '',
  "description" TEXT NOT NULL,
  "mode" "CommercialMode" NOT NULL,
  "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
  "categoryId" TEXT NOT NULL,
  "priceCents" INTEGER,
  "salePriceCents" INTEGER,
  "costCents" INTEGER,
  "minimumQuantity" INTEGER NOT NULL DEFAULT 1,
  "leadDays" INTEGER,
  "weightGrams" INTEGER,
  "dimensions" JSONB,
  "featured" BOOLEAN NOT NULL DEFAULT FALSE,
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  "deletedAt" TIMESTAMP(3),
  "revision" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

CREATE TABLE "ProductImage" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "alt" TEXT NOT NULL DEFAULT '',
  "position" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductVariant" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "sku" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "attributes" JSONB NOT NULL,
  "priceCents" INTEGER,
  "stockControlled" BOOLEAN NOT NULL DEFAULT FALSE,
  "stock" INTEGER NOT NULL DEFAULT 0,
  "lowStockThreshold" INTEGER NOT NULL DEFAULT 5,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ProductVariant_sku_key" ON "ProductVariant"("sku");

CREATE TABLE "ProductOption" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "values" JSONB NOT NULL,
  CONSTRAINT "ProductOption_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InventoryMovement" (
  "id" TEXT NOT NULL,
  "variantId" TEXT NOT NULL,
  "delta" INTEGER NOT NULL,
  "reason" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "orderId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InventoryMovement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CustomizationTemplate" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "baseImageUrl" TEXT NOT NULL,
  "maxFileBytes" INTEGER NOT NULL DEFAULT 5242880,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT "CustomizationTemplate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CustomizationArea" (
  "id" TEXT NOT NULL,
  "templateId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "x" DOUBLE PRECISION NOT NULL,
  "y" DOUBLE PRECISION NOT NULL,
  "width" DOUBLE PRECISION NOT NULL,
  "height" DOUBLE PRECISION NOT NULL,
  "printWidthMm" INTEGER,
  "printHeightMm" INTEGER,
  "allowText" BOOLEAN NOT NULL DEFAULT TRUE,
  "allowImage" BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT "CustomizationArea_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CustomerDesign" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "variantId" TEXT NOT NULL,
  "templateId" TEXT NOT NULL,
  "composition" JSONB NOT NULL,
  "templateSnapshot" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CustomerDesign_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StoredAsset" (
  "id" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "mime" TEXT NOT NULL,
  "bytes" INTEGER NOT NULL,
  "storageKey" TEXT NOT NULL,
  "public" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StoredAsset_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "StoredAsset_storageKey_key" ON "StoredAsset"("storageKey");

CREATE TABLE "Cart" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Cart_userId_key" ON "Cart"("userId");

CREATE TABLE "CartItem" (
  "id" TEXT NOT NULL,
  "cartId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "variantId" TEXT NOT NULL,
  "designId" TEXT,
  "quantity" INTEGER NOT NULL,
  CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Address" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "recipient" TEXT NOT NULL,
  "postalCode" TEXT NOT NULL,
  "street" TEXT NOT NULL,
  "number" TEXT NOT NULL,
  "complement" TEXT,
  "district" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Order" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "requestKey" TEXT NOT NULL,
  "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
  "subtotalCents" INTEGER NOT NULL,
  "totalCents" INTEGER NOT NULL,
  "addressSnapshot" JSONB NOT NULL,
  "shippingStatus" TEXT NOT NULL DEFAULT 'PENDING_QUOTE',
  "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING_INTEGRATION',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Order_requestKey_key" ON "Order"("requestKey");

CREATE TABLE "OrderItem" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "variantId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "unitPriceCents" INTEGER NOT NULL,
  "snapshot" JSONB NOT NULL,
  CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrderStatusHistory" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "status" "OrderStatus" NOT NULL,
  "actorId" TEXT NOT NULL,
  "note" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrderStatusHistory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QuoteRequest" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "status" "QuoteStatus" NOT NULL DEFAULT 'NEW',
  "message" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "QuoteRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QuoteItem" (
  "id" TEXT NOT NULL,
  "quoteId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "options" JSONB NOT NULL,
  "snapshot" JSONB NOT NULL,
  CONSTRAINT "QuoteItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QuoteHistory" (
  "id" TEXT NOT NULL,
  "quoteId" TEXT NOT NULL,
  "status" "QuoteStatus" NOT NULL,
  "actorId" TEXT NOT NULL,
  "note" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "QuoteHistory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PaymentRecord" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "amountCents" INTEGER NOT NULL,
  "reference" TEXT NOT NULL,
  "method" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PaymentRecord_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PaymentRecord_reference_key" ON "PaymentRecord"("reference");

CREATE TABLE "StoreSettings" (
  "id" TEXT NOT NULL DEFAULT 'store',
  "businessName" TEXT NOT NULL DEFAULT 'M.A. Confecções e Brindes',
  "contactEmail" TEXT,
  "purchasePolicy" TEXT NOT NULL DEFAULT '',
  "orderingEnabled" BOOLEAN NOT NULL DEFAULT FALSE,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StoreSettings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "detail" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Category_parentId_active_position_idx" ON "Category"("parentId", "active", "position");
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "Product_categoryId_status_deletedAt_idx" ON "Product"("categoryId", "status", "deletedAt");
CREATE INDEX "Product_featured_createdAt_idx" ON "Product"("featured", "createdAt");
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "ProductImage_productId_position_idx" ON "ProductImage"("productId", "position");
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "ProductVariant_productId_active_idx" ON "ProductVariant"("productId", "active");
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "ProductOption_productId_idx" ON "ProductOption"("productId");
ALTER TABLE "ProductOption" ADD CONSTRAINT "ProductOption_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "InventoryMovement_variantId_createdAt_idx" ON "InventoryMovement"("variantId", "createdAt");
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "CustomizationTemplate_productId_active_idx" ON "CustomizationTemplate"("productId", "active");
ALTER TABLE "CustomizationTemplate" ADD CONSTRAINT "CustomizationTemplate_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "CustomizationArea_templateId_idx" ON "CustomizationArea"("templateId");
ALTER TABLE "CustomizationArea" ADD CONSTRAINT "CustomizationArea_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "CustomizationTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "CustomerDesign_userId_createdAt_idx" ON "CustomerDesign"("userId", "createdAt");
ALTER TABLE "CustomerDesign" ADD CONSTRAINT "CustomerDesign_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CustomerDesign" ADD CONSTRAINT "CustomerDesign_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CustomerDesign" ADD CONSTRAINT "CustomerDesign_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CustomerDesign" ADD CONSTRAINT "CustomerDesign_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "CustomizationTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "StoredAsset_ownerId_idx" ON "StoredAsset"("ownerId");
ALTER TABLE "StoredAsset" ADD CONSTRAINT "StoredAsset_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "CartItem_cartId_idx" ON "CartItem"("cartId");
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_designId_fkey" FOREIGN KEY ("designId") REFERENCES "CustomerDesign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "Address_userId_idx" ON "Address"("userId");
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt");
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "OrderStatusHistory_orderId_createdAt_idx" ON "OrderStatusHistory"("orderId", "createdAt");
ALTER TABLE "OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "QuoteRequest_status_createdAt_idx" ON "QuoteRequest"("status", "createdAt");
CREATE INDEX "QuoteRequest_userId_idx" ON "QuoteRequest"("userId");
ALTER TABLE "QuoteRequest" ADD CONSTRAINT "QuoteRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "QuoteItem_quoteId_idx" ON "QuoteItem"("quoteId");
ALTER TABLE "QuoteItem" ADD CONSTRAINT "QuoteItem_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "QuoteRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "QuoteItem" ADD CONSTRAINT "QuoteItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "QuoteHistory_quoteId_createdAt_idx" ON "QuoteHistory"("quoteId", "createdAt");
ALTER TABLE "QuoteHistory" ADD CONSTRAINT "QuoteHistory_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "QuoteRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "PaymentRecord_orderId_idx" ON "PaymentRecord"("orderId");
ALTER TABLE "PaymentRecord" ADD CONSTRAINT "PaymentRecord_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");
