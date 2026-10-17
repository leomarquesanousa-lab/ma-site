import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { CommerceError } from "./auth";
import { metadataSuggestions } from "./editor-metadata";
import { reaisToCents } from "./currency";
import { selectVariantMockups } from "./mockups";
import {resolvePersonalizationModel} from './personalization-models';
import { categoryImageUrl, choice, flag, imageUrl, integer, list, modes, money, object, slug, statuses, text, productSummary } from "./validation";
async function transact<T>(transaction: Prisma.TransactionClient | undefined, action: (tx: Prisma.TransactionClient) => Promise<T>) {
  return transaction ? action(transaction) : db.$transaction(action, { timeout: 20000 });
}
function optionalReais(value: unknown, legacy: unknown, label: string) {
  if (value === undefined) return money(legacy, label);
  if (value === "" || value === null) return null;
  try { return reaisToCents(value); } catch (error) { throw new CommerceError(error instanceof Error ? error.message : `${label} inválido.`); }
}

async function requirePublicImages(tx: Prisma.TransactionClient, urls: string[]) {
  const ids = [...new Set(urls.filter(url => url.startsWith("/api/arquivos/")).map(url => url.slice("/api/arquivos/".length)))];
  if (ids.length && await tx.storedAsset.count({ where: { id: { in: ids }, public: true } }) !== ids.length) {
    throw new CommerceError("Imagem comercial inexistente ou privada. Envie pelo upload de catálogo.");
  }
}

export async function saveProduct(actorId: string, raw: unknown) {
  const b = object(raw), id = text(b.id, "ID", 100, true);
  const suggestedSeo = metadataSuggestions(b);
  const mode = choice(b.mode, modes, "Modalidade");
  const priceCents = optionalReais(b.basePrice, b.priceCents, "Preço"), salePriceCents = optionalReais(b.salePrice, b.salePriceCents, "Promoção");
  if (mode !== "QUOTE_ONLY" && priceCents === null) throw new CommerceError("Preço base: informe um valor em reais.");
  if (salePriceCents !== null && (priceCents === null || salePriceCents > priceCents)) throw new CommerceError("Preço promocional inválido.");
  const data = {
    name: text(b.name, "Nome", 180), slug: slug(b.slug), sku: text(b.sku, "SKU", 100),
    description: text(b.description, "Descrição", 10000), shortDescription: productSummary(b.shortDescription),
    mode, categoryId: text(b.categoryId, "Categoria", 100), status: choice(b.status, statuses, "Status"),
    priceCents: mode === "QUOTE_ONLY" ? null : priceCents, salePriceCents: mode === "QUOTE_ONLY" ? null : salePriceCents,
    costCents: money(b.costCents, "Custo"), minimumQuantity: integer(b.minimumQuantity ?? 1, "Mínimo", 1, 10000),
    leadDays: money(b.leadDays, "Prazo"), weightGrams: money(b.weightGrams, "Peso"),
    dimensions: b.dimensions == null ? Prisma.JsonNull : object(b.dimensions) as Prisma.InputJsonObject,
    featured: flag(b.featured ?? false), seoTitle: text(b.seoTitle ?? suggestedSeo.seoTitle, "Título SEO", 180, true), seoDescription: text(b.seoDescription ?? suggestedSeo.seoDescription, "Descrição SEO", 500, true),
  };
  if (b.dimensions != null) {
    const dimensions = object(b.dimensions);
    data.dimensions = { width: integer(dimensions.width, "Largura (cm)", 1, 1000), height: integer(dimensions.height, "Altura (cm)", 1, 1000), length: integer(dimensions.length, "Comprimento (cm)", 1, 1000) };
  }
  const images = list(b.images ?? [], "Imagens", 20).map((raw, position) => { const i = object(raw); return { url: categoryImageUrl(i.url), alt: text(i.alt, "Descrição da imagem", 180, true), position }; });
  const options = list(b.options ?? [], "Opções", 20).map(raw => { const o = object(raw); return { name: text(o.name, "Opção", 100), values: list(o.values, "Valores", 50).map(v => text(v, "Valor", 100)) }; });
  return db.$transaction(async tx => {
    if (await tx.product.findFirst({ where: { slug: data.slug, ...(id ? { id: { not: id } } : {}) }, select: { id: true } })) throw new CommerceError("Este slug já está em uso por outro produto.", 409);
    await requirePublicImages(tx, images.map(image => image.url));
    const category = await tx.category.findUnique({ where: { id: data.categoryId }, include: { parent: true } });
    if (!category) throw new CommerceError("Categoria inexistente.");
    if ((category.slug === "uniformes" || category.parent?.slug === "uniformes") && mode !== "QUOTE_ONLY") throw new CommerceError("Uniformes são exclusivamente sob orçamento.");
    if (id) {
      const existing = await tx.product.findFirst({ where: { id, deletedAt: null } });
      if (!existing) throw new CommerceError("Produto inexistente.", 404);
      if (existing.revision !== integer(b.revision, "Revisão")) throw new CommerceError("Produto alterado por outra pessoa. Recarregue antes de salvar.", 409);
      if (existing.mode !== mode && await tx.cartItem.count({ where: { productId: id } })) throw new CommerceError("Produto presente em carrinhos. Mantenha a modalidade ou inative o produto.");
    }
    const nested = { images: { create: images }, options: { create: options } };
    const product = id ? await tx.product.update({ where: { id }, data: { ...data, revision: { increment: 1 }, images: { deleteMany: {}, create: images }, options: { deleteMany: {}, create: options } } }) : await tx.product.create({ data: { ...data, ...nested } });
    if (b.variants !== undefined) {
      const variants = list(b.variants, "Variações", 30).map(object);
      const ids = variants.filter(v=>v.id).map(v=>text(v.id,"Variação",100));
      if (new Set(ids).size !== ids.length) throw new CommerceError("Variação repetida no formulário.");
      // Removed saved variants are inactivated; order/cart/design references survive.
      await tx.productVariant.updateMany({where:{productId:product.id,...(ids.length?{id:{notIn:ids}}:{})},data:{active:false}});
      for (const variant of variants) await saveVariant(actorId, {...variant, productId:product.id}, tx);
    }
    if(b.personalizationModel!=null&&mode==='CUSTOMIZABLE'){
      const views=await resolvePersonalizationModel(tx,b.personalizationModel);
      // Copy a versioned snapshot so existing designs/orders retain their original basis.
      // All technical settings come from the selected server-side model, never form dimensions.
      await tx.customizationTemplate.updateMany({where:{productId:product.id,active:true},data:{active:false}});
      for(const view of views)await saveTemplate(actorId,{productId:product.id,name:view.name,productType:view.productType,baseImageUrl:view.baseImageUrl,maxFileBytes:view.maxFileBytes,variantIds:[],areas:view.areas},tx);
      await tx.auditLog.create({data:{actorId,entity:'Product',entityId:product.id,action:'SELECT_PERSONALIZATION_MODEL',detail:{sourceViews:views.map(v=>v.id)}}});
    }else if (b.templateDrafts !== undefined) {
      for (const template of list(b.templateDrafts,"Vistas",10).map(object)) {
        if(data.status==="DRAFT"&&!template.id&&!template.name&&!template.baseImageUrl&&(!Array.isArray(template.areas)||!template.areas.length))continue;
        if (template.id && template.remove === true) {
          const changed = await tx.customizationTemplate.updateMany({where:{id:text(template.id,"Vista",100),productId:product.id},data:{active:false}});
          if(changed.count!==1)throw new CommerceError("Vista não pertence ao produto.");
        } else if (template.dirty === true || !template.id) {
          let variantIds = template.variantIds ?? [];
          if (template.variantSkus !== undefined) {
            const skus=list(template.variantSkus,"Variantes do mockup",30).map(s=>text(s,"SKU da variante",100));
            if(new Set(skus).size!==skus.length)throw new CommerceError("Variante repetida no mockup.");
            const matches=skus.length?await tx.productVariant.findMany({where:{productId:product.id,sku:{in:skus}},select:{id:true}}):[];
            if(matches.length!==skus.length)throw new CommerceError("Mockup: revise as variantes selecionadas após alterar seus SKUs.");
            variantIds=matches.map(v=>v.id);
          }
          if (template.id) {
            const changed=await tx.customizationTemplate.updateMany({where:{id:text(template.id,"Vista",100),productId:product.id},data:{active:false}});
            if(changed.count!==1)throw new CommerceError("Vista não pertence ao produto.");
          }
          await saveTemplate(actorId,{...template,variantIds,productId:product.id},tx);
        }
      }
    }
    if (data.status === "ACTIVE") {
      if (!category.active || category.parent?.active === false) throw new CommerceError("Ative a categoria antes de publicar o produto.");
      if (mode !== "QUOTE_ONLY" && !await tx.productVariant.count({where:{productId:product.id,active:true}})) throw new CommerceError("Variações: adicione pelo menos uma opção ativa para publicar.");
      if (mode === "CUSTOMIZABLE") {
        const variants=await tx.productVariant.findMany({where:{productId:product.id,active:true},select:{id:true,name:true}});
        const mockups=await tx.customizationTemplate.findMany({where:{productId:product.id,active:true},include:{areas:true}});
        for(const variant of variants){
          const views=selectVariantMockups(mockups,variant.id);
          if(!views.length||views.some(view=>!view.baseImageUrl||!view.areas.length||view.areas.some(area=>!area.printWidthMm||!area.printHeightMm||area.width<=0||area.height<=0||area.x<0||area.y<0||area.x+area.width>1||area.y+area.height>1)))throw new CommerceError(`Modelo de personalização: selecione um modelo completo para a variante ${variant.name} antes de publicar.`);
        }
      }
    }
    await tx.auditLog.create({ data: { actorId, action: id ? "UPDATE" : "CREATE", entity: "Product", entityId: product.id, detail: { name: product.name, mode, status: data.status } } });
    return product;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, maxWait: 10000, timeout: 60000 });
}
export async function saveCategory(actorId: string, raw: unknown) {
  const b = object(raw), id = text(b.id, "ID", 100, true), parentId = text(b.parentId, "Principal", 100, true) || null;
  const data = { name: text(b.name, "Nome", 180), slug: slug(b.slug), description: text(b.description, "Descrição", 2000, true), imageUrl: b.imageUrl ? categoryImageUrl(b.imageUrl) : null, active: flag(b.active), position: integer(b.position ?? 0, "Ordem", 0, 10000), parentId };
  const suggestions = metadataSuggestions(data);
  const seoTitle = text(b.seoTitle ?? suggestions.seoTitle, "Título SEO", 180, true);
  const seoDescription = text(b.seoDescription ?? suggestions.seoDescription, "Descrição SEO", 500, true);
  return db.$transaction(async tx => {
    try { await tx.$queryRaw`SELECT "seoTitle", "seoDescription" FROM public."Category" LIMIT 0`; }
    catch { throw new CommerceError("SEO de categorias pendente: aplique a migration específica autorizada na homologação antes de salvar.", 503); }
    if (await tx.category.findFirst({ where: { slug: data.slug, ...(id ? { id: { not: id } } : {}) }, select: { id: true } })) throw new CommerceError("Este slug já está em uso por outra categoria.", 409);
    await requirePublicImages(tx, data.imageUrl ? [data.imageUrl] : []);
    if (parentId) {
      const parent = await tx.category.findUnique({ where: { id: parentId } });
      if (!parent || parent.parentId || parentId === id) throw new CommerceError("Selecione uma categoria principal válida.");
      if (id && parent.slug === "uniformes" && await tx.product.count({ where: { categoryId: id, mode: { not: "QUOTE_ONLY" } } })) throw new CommerceError("Esta categoria contém produtos de compra direta; não pode ser movida para uniformes.");
    }
    if (id && data.slug === "uniformes" && await tx.product.count({ where: { mode: { not: "QUOTE_ONLY" }, OR: [{ categoryId: id }, { category: { parentId: id } }] } })) throw new CommerceError("Uniformes não pode conter produtos de compra direta.");
    if (id && parentId && await tx.category.count({ where: { parentId: id } })) throw new CommerceError("Categoria com filhas não pode virar subcategoria.");
    const category = id ? await tx.category.update({ where: { id }, data }) : await tx.category.create({ data });
    await tx.$executeRaw`UPDATE public."Category" SET "seoTitle"=${seoTitle}, "seoDescription"=${seoDescription} WHERE id=${category.id}`;
    await tx.auditLog.create({ data: { actorId, action: id ? "UPDATE" : "CREATE", entity: "Category", entityId: category.id, detail: data } });
    return { ...category, seoTitle, seoDescription };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}
export async function saveVariant(actorId: string, raw: unknown, transaction?: Prisma.TransactionClient) {
  const b = object(raw), id = text(b.id, "ID", 100, true), productId = text(b.productId, "Produto", 100);
  const attributes = object(b.attributes ?? {});
  const clean: Record<string, string> = {};
  for (const [key, value] of Object.entries(attributes)) clean[text(key, "Atributo", 60)] = text(value, `Valor do atributo ${key}`, 100);
  let priceCents: number | null;
  if (b.useProductPrice === true) priceCents = null;
  else if (Object.prototype.hasOwnProperty.call(b, "price")) {
    try { priceCents = reaisToCents(b.price); } catch (error) { throw new CommerceError(error instanceof Error ? error.message : "Preço inválido."); }
  } else priceCents = money(b.priceCents, "Preço"); // Existing API clients still send integer cents.
  const data = { sku: text(b.sku, "SKU", 100), name: text(b.name, "Nome", 180), attributes: clean, priceCents, stockControlled: flag(b.stockControlled), lowStockThreshold: integer(b.lowStockThreshold ?? 5, "Estoque baixo", 0, 10000), active: flag(b.active) };
  return transact(transaction, async tx => {
    if (!await tx.product.findFirst({ where: { id: productId, deletedAt: null } })) throw new CommerceError("Produto inválido.");
    const previous = id ? await tx.productVariant.findFirst({ where: { id, productId } }) : null;
    if (id && !previous) throw new CommerceError("Variação inválida.");
    const stock = b.stock === undefined ? previous?.stock ?? 0 : integer(b.stock,"Estoque",0,1000000);
    if (previous && stock !== previous.stock && integer(b.expectedStock,"Estoque original",0,1000000) !== previous.stock) throw new CommerceError("O estoque mudou. Recarregue antes de salvar.",409);
    const variant = id ? await tx.productVariant.update({ where: { id }, data }) : await tx.productVariant.create({ data: { ...data, productId } });
    if (stock !== (previous?.stock ?? 0)) {
      const changed = await tx.productVariant.updateMany({where:{id:variant.id,stock:previous?.stock ?? 0},data:{stock}});
      if(changed.count!==1)throw new CommerceError("O estoque mudou. Recarregue antes de salvar.",409);
      await tx.inventoryMovement.create({data:{variantId:variant.id,delta:stock-(previous?.stock??0),reason:"Cadastro integrado de produto",actorId}});
    }
    await tx.auditLog.create({ data: { actorId, action: id ? "UPDATE" : "CREATE", entity: "Variant", entityId: variant.id, detail: data } });
    return variant;
  });
}
export async function saveTemplate(actorId: string, raw: unknown, transaction?: Prisma.TransactionClient) {
  const b = object(raw), productId = text(b.productId, "Produto", 100);
  if (b.action === "classify") {
    const id = text(b.id, "Vista", 100), productType = choice(b.productType, ["MUG", "SHIRT"], "Tipo de produto");
    return transact(transaction, async tx => {
      const changed = await tx.customizationTemplate.updateMany({ where: { id, productId, productType: "UNCONFIGURED" }, data: { productType } });
      if (changed.count !== 1) throw new CommerceError("Vista já classificada ou inexistente. Recarregue.", 409);
      await tx.auditLog.create({ data: { actorId, action: "CLASSIFY", entity: "Template", entityId: id, detail: { productType } } });
      return { id };
    });
  }
  const name = text(b.name, "Vista", 100);
  const productType = choice(b.productType, ["MUG", "SHIRT"], "Tipo de produto");
  const variantIds = list(b.variantIds ?? [], "Variantes", 100).map(v=>text(v,"Variante",100));
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
  return transact(transaction, async tx => {
    const product = await tx.product.findFirst({ where: { id: productId, deletedAt: null } });
    if (!product || product.mode !== "CUSTOMIZABLE") throw new CommerceError("Produto não personalizável.");
    if (variantIds.length && await tx.productVariant.count({where:{id:{in:variantIds},productId}})!==variantIds.length)throw new CommerceError("Variantes invalidas.");
    // Version templates instead of mutating the basis of existing designs and order snapshots.
    await requirePublicImages(tx, [categoryImageUrl(b.baseImageUrl)]);
    const sameView=await tx.customizationTemplate.findMany({where:{productId,name,active:true},select:{id:true,variantIds:true}});
    const binding=[...variantIds].sort().join("\0");
    const replaced=sameView.filter(t=>[...t.variantIds].sort().join("\0")===binding).map(t=>t.id);
    if(replaced.length)await tx.customizationTemplate.updateMany({ where: { id:{in:replaced},productId }, data: { active: false } });
    const template = await tx.customizationTemplate.create({ data: { productId, name, productType, variantIds, baseImageUrl: categoryImageUrl(b.baseImageUrl), maxFileBytes, areas: { create: areas } } });
    await tx.auditLog.create({ data: { actorId, action: "CONFIGURE", entity: "Template", entityId: template.id, detail: { productId } } });
    return template;
  });
}
