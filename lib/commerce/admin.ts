import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { CommerceError } from "./auth";
import { choice, flag, imageUrl, integer, list, modes, money, object, slug, statuses, text } from "./validation";

async function requirePublicImages(tx: Prisma.TransactionClient, urls: string[]) {
  const ids = [...new Set(urls.filter(url => url.startsWith("/api/arquivos/")).map(url => url.slice("/api/arquivos/".length)))];
  if (ids.length && await tx.storedAsset.count({ where: { id: { in: ids }, public: true } }) !== ids.length) {
    throw new CommerceError("Imagem comercial inexistente ou privada. Envie pelo upload de catálogo.");
  }
}

export async function saveProduct(actorId: string, raw: unknown) {
  const b = object(raw), id = text(b.id, "ID", 100, true);
  const mode = choice(b.mode, modes, "Modalidade");
  const priceCents = money(b.priceCents, "Preço"), salePriceCents = money(b.salePriceCents, "Promoção");
  if (mode !== "QUOTE_ONLY" && priceCents === null) throw new CommerceError("Informe o preço em centavos.");
  if (salePriceCents !== null && (priceCents === null || salePriceCents > priceCents)) throw new CommerceError("Preço promocional inválido.");
  const data = {
    name: text(b.name, "Nome", 180), slug: slug(b.slug), sku: text(b.sku, "SKU", 100),
    description: text(b.description, "Descrição", 10000), shortDescription: text(b.shortDescription, "Resumo", 500, true),
    mode, categoryId: text(b.categoryId, "Categoria", 100), status: choice(b.status, statuses, "Status"),
    priceCents: mode === "QUOTE_ONLY" ? null : priceCents, salePriceCents: mode === "QUOTE_ONLY" ? null : salePriceCents,
    costCents: money(b.costCents, "Custo"), minimumQuantity: integer(b.minimumQuantity ?? 1, "Mínimo", 1, 10000),
    leadDays: money(b.leadDays, "Prazo"), weightGrams: money(b.weightGrams, "Peso"),
    dimensions: b.dimensions == null ? Prisma.JsonNull : object(b.dimensions) as Prisma.InputJsonObject,
    featured: flag(b.featured ?? false), seoTitle: text(b.seoTitle, "Título SEO", 180, true), seoDescription: text(b.seoDescription, "Descrição SEO", 500, true),
  };
  if (b.dimensions != null) {
    const dimensions = object(b.dimensions);
    data.dimensions = { width: integer(dimensions.width, "Largura (cm)", 1, 1000), height: integer(dimensions.height, "Altura (cm)", 1, 1000), length: integer(dimensions.length, "Comprimento (cm)", 1, 1000) };
  }
  const images = list(b.images ?? [], "Imagens", 20).map((raw, position) => { const i = object(raw); return { url: imageUrl(i.url), alt: text(i.alt, "Descrição da imagem", 180, true), position }; });
  const options = list(b.options ?? [], "Opções", 20).map(raw => { const o = object(raw); return { name: text(o.name, "Opção", 100), values: list(o.values, "Valores", 50).map(v => text(v, "Valor", 100)) }; });
  return db.$transaction(async tx => {
    await requirePublicImages(tx, images.map(image => image.url));
    const category = await tx.category.findUnique({ where: { id: data.categoryId }, include: { parent: true } });
    if (!category) throw new CommerceError("Categoria inexistente.");
    if ((category.slug === "uniformes" || category.parent?.slug === "uniformes") && mode !== "QUOTE_ONLY") throw new CommerceError("Uniformes são exclusivamente sob orçamento.");
    if (data.status === "ACTIVE" && mode !== "QUOTE_ONLY") {
      if (!id || !await tx.productVariant.count({ where: { productId: id, active: true } })) throw new CommerceError("Salve como rascunho e cadastre uma variação ativa antes de publicar.");
      if (mode === "CUSTOMIZABLE" && !await tx.customizationTemplate.count({ where: { productId: id, active: true, areas: { some: {} } } })) throw new CommerceError("Configure a imagem-base e uma área antes de publicar.");
    }
    if (id) {
      const existing = await tx.product.findFirst({ where: { id, deletedAt: null } });
      if (!existing) throw new CommerceError("Produto inexistente.", 404);
      if (existing.revision !== integer(b.revision, "Revisão")) throw new CommerceError("Produto alterado por outra pessoa. Recarregue antes de salvar.", 409);
      if (existing.mode !== mode && await tx.cartItem.count({ where: { productId: id } })) throw new CommerceError("Produto presente em carrinhos. Mantenha a modalidade ou inative o produto.");
    }
    const nested = { images: { create: images }, options: { create: options } };
    const product = id ? await tx.product.update({ where: { id }, data: { ...data, revision: { increment: 1 }, images: { deleteMany: {}, create: images }, options: { deleteMany: {}, create: options } } }) : await tx.product.create({ data: { ...data, ...nested } });
    await tx.auditLog.create({ data: { actorId, action: id ? "UPDATE" : "CREATE", entity: "Product", entityId: product.id, detail: { name: product.name, mode, status: data.status } } });
    return product;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}
export async function saveCategory(actorId: string, raw: unknown) {
  const b = object(raw), id = text(b.id, "ID", 100, true), parentId = text(b.parentId, "Principal", 100, true) || null;
  const data = { name: text(b.name, "Nome", 180), slug: slug(b.slug), description: text(b.description, "Descrição", 2000, true), imageUrl: b.imageUrl ? imageUrl(b.imageUrl) : null, active: flag(b.active), position: integer(b.position ?? 0, "Ordem", 0, 10000), parentId };
  return db.$transaction(async tx => {
    await requirePublicImages(tx, data.imageUrl ? [data.imageUrl] : []);
    if (parentId) {
      const parent = await tx.category.findUnique({ where: { id: parentId } });
      if (!parent || parent.parentId || parentId === id) throw new CommerceError("Selecione uma categoria principal válida.");
      if (id && parent.slug === "uniformes" && await tx.product.count({ where: { categoryId: id, mode: { not: "QUOTE_ONLY" } } })) throw new CommerceError("Esta categoria contém produtos de compra direta; não pode ser movida para uniformes.");
    }
    if (id && data.slug === "uniformes" && await tx.product.count({ where: { mode: { not: "QUOTE_ONLY" }, OR: [{ categoryId: id }, { category: { parentId: id } }] } })) throw new CommerceError("Uniformes não pode conter produtos de compra direta.");
    if (id && parentId && await tx.category.count({ where: { parentId: id } })) throw new CommerceError("Categoria com filhas não pode virar subcategoria.");
    const category = id ? await tx.category.update({ where: { id }, data }) : await tx.category.create({ data });
    await tx.auditLog.create({ data: { actorId, action: id ? "UPDATE" : "CREATE", entity: "Category", entityId: category.id, detail: data } });
    return category;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}
export async function saveVariant(actorId: string, raw: unknown) {
  const b = object(raw), id = text(b.id, "ID", 100, true), productId = text(b.productId, "Produto", 100);
  const attributes = object(b.attributes ?? {});
  const clean: Record<string, string> = {};
  for (const [key, value] of Object.entries(attributes)) clean[text(key, "Atributo", 60)] = text(value, "Valor", 100);
  const data = { sku: text(b.sku, "SKU", 100), name: text(b.name, "Nome", 180), attributes: clean, priceCents: money(b.priceCents, "Preço"), stockControlled: flag(b.stockControlled), lowStockThreshold: integer(b.lowStockThreshold ?? 5, "Estoque baixo", 0, 10000), active: flag(b.active) };
  return db.$transaction(async tx => {
    if (!await tx.product.findFirst({ where: { id: productId, deletedAt: null } })) throw new CommerceError("Produto inválido.");
    if (id && !await tx.productVariant.findFirst({ where: { id, productId } })) throw new CommerceError("Variação inválida.");
    const variant = id ? await tx.productVariant.update({ where: { id }, data }) : await tx.productVariant.create({ data: { ...data, productId } });
    await tx.auditLog.create({ data: { actorId, action: id ? "UPDATE" : "CREATE", entity: "Variant", entityId: variant.id, detail: data } });
    return variant;
  });
}
export async function saveTemplate(actorId: string, raw: unknown) {
  const b = object(raw), productId = text(b.productId, "Produto", 100);
  const name = text(b.name, "Vista", 100);
  const maxFileBytes = integer(b.maxFileBytes ?? 5242880, "Tamanho máximo", 1024, 5242880);
  const areas = list(b.areas, "Áreas", 10).map(raw => {
    const a = object(raw); const coord = (key: string) => { const n = a[key]; if (typeof n !== "number" || !Number.isFinite(n) || n < 0 || n > 1) throw new CommerceError("Coordenadas devem estar entre 0 e 1."); return n; };
    const x = coord("x"), y = coord("y"), width = coord("width"), height = coord("height");
    if (!width || !height || x + width > 1 || y + height > 1) throw new CommerceError("Área fora da imagem.");
    const allowText = flag(a.allowText), allowImage = flag(a.allowImage);
    if (!allowText && !allowImage) throw new CommerceError("Uma área precisa aceitar texto, imagem ou ambos.");
    return { name: text(a.name, "Nome da área", 100), x, y, width, height, allowText, allowImage, printWidthMm: money(a.printWidthMm, "Largura de impressão"), printHeightMm: money(a.printHeightMm, "Altura de impressão") };
  });
  if (!areas.length) throw new CommerceError("Configure pelo menos uma área.");
  return db.$transaction(async tx => {
    const product = await tx.product.findFirst({ where: { id: productId, deletedAt: null } });
    if (!product || product.mode !== "CUSTOMIZABLE") throw new CommerceError("Produto não personalizável.");
    // Version templates instead of mutating the basis of existing designs and order snapshots.
    await requirePublicImages(tx, [imageUrl(b.baseImageUrl)]);
    await tx.customizationTemplate.updateMany({ where: { productId, name }, data: { active: false } });
    const template = await tx.customizationTemplate.create({ data: { productId, name, baseImageUrl: imageUrl(b.baseImageUrl), maxFileBytes, areas: { create: areas } } });
    await tx.auditLog.create({ data: { actorId, action: "CONFIGURE", entity: "Template", entityId: template.id, detail: { productId } } });
    return template;
  });
}
