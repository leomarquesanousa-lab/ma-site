import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { CommerceError, requirePermission, requireUser, sameOrigin, type Permission } from "@/lib/commerce/auth";
import { saveCategory, saveProduct, saveTemplate, saveVariant } from "@/lib/commerce/admin";
import { activeProductWhere, addCart, cartFor, changeOrder, placeOrder } from "@/lib/commerce/service";
import { boundedBody } from "@/lib/commerce/storage";
import { choice, composition, flag, integer, object, text } from "@/lib/commerce/validation";

function privateJson(data: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "private, no-store");
  return NextResponse.json(data, { ...init, headers });
}
type Context = { params: Promise<{ path: string[] }> };
const adminPermissions: Record<string, Permission> = { products: "products", categories: "categories", variants: "products", templates: "products", inventory: "inventory", orders: "orders", quotes: "quotes", customers: "customers", settings: "settings", audit: "audit", dashboard: "dashboard" };
function fail(error: unknown) {
  if (error instanceof CommerceError) return privateJson({ error: error.message }, { status: error.status });
  if (error instanceof Prisma.PrismaClientKnownRequestError && ["P2002", "P2003", "P2025", "P2034"].includes(error.code)) return privateJson({ error: "Conflito de dados. Confira os campos ou recarregue e tente novamente." }, { status: 409 });
  console.error("COMMERCE_ERROR", error instanceof Error ? error.name : "unknown");
  return privateJson({ error: "Não foi possível concluir. A estrutura comercial precisa estar provisionada e disponível." }, { status: 503 });
}
export async function GET(request: Request, context: Context) {
  try {
    const path = (await context.params).path;
    if (path[0] === "admin") {
      const resource = path[1], permission = adminPermissions[resource];
      if (!permission) throw new CommerceError("Recurso inexistente.", 404);
      await requirePermission(permission);
      let result: unknown;
      switch (resource) {
        case "products": result = await db.product.findMany({ where: { deletedAt: null }, include: { category: true, images: { orderBy: { position: "asc" } }, variants: true, options: true, templates: { include: { areas: true } } }, orderBy: { updatedAt: "desc" }, take: 200 }); break;
        case "categories": result = await db.category.findMany({ orderBy: { position: "asc" } }); break;
        case "inventory": result = await db.productVariant.findMany({ include: { product: { select: { name: true } }, movements: { orderBy: { createdAt: "desc" }, take: 30 } }, take: 200 }); break;
        case "orders": result = await db.order.findMany({ include: { user: { select: { name: true, email: true } }, items: true, history: { orderBy: { createdAt: "asc" } }, payments: true }, orderBy: { createdAt: "desc" }, take: 200 }); break;
        case "quotes": result = await db.quoteRequest.findMany({ include: { user: { select: { name: true, email: true } }, items: true, history: { orderBy: { createdAt: "asc" } } }, orderBy: { createdAt: "desc" }, take: 200 }); break;
        case "customers": result = await db.user.findMany({ where: { role: "CUSTOMER" }, select: { id: true, name: true, email: true, createdAt: true, _count: { select: { orders: true, quotes: true } } }, take: 200 }); break;
        case "settings": result = await db.storeSettings.findUnique({ where: { id: "store" } }); break;
        case "audit": result = await db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 }); break;
        case "dashboard": {
          const [orders, activeProducts, pendingQuotes, awaitingOrders, variants, payments] = await Promise.all([db.order.count(), db.product.count({ where: { status: "ACTIVE", deletedAt: null } }), db.quoteRequest.count({ where: { status: { in: ["NEW", "REVIEWING"] } } }), db.order.count({ where: { status: "PENDING" } }), db.productVariant.findMany({ where: { active: true, stockControlled: true }, select: { stock: true, lowStockThreshold: true } }), db.paymentRecord.aggregate({ where: { status: "CONFIRMED" }, _sum: { amountCents: true } })]);
          result = { orders, activeProducts, pendingQuotes, awaitingOrders, lowStock: variants.filter(v => v.stock <= v.lowStockThreshold).length, confirmedSalesCents: payments._sum.amountCents ?? 0 }; break;
        }
        default: throw new CommerceError("Recurso inexistente.", 404);
      }
      return privateJson(result, { headers: { "Cache-Control": "no-store" } });
    }
    const user = await requireUser();
    if (path[0] === "cart") {
      const cart = await cartFor(user.id);
      return privateJson(cart ? { id: cart.id, items: cart.items.map(i => ({ id: i.id, quantity: i.quantity, product: { name: i.product.name, slug: i.product.slug, mode: i.product.mode, priceCents: i.product.priceCents, salePriceCents: i.product.salePriceCents, minimumQuantity: i.product.minimumQuantity }, variant: { id: i.variant.id, name: i.variant.name, priceCents: i.variant.priceCents, stock: i.variant.stock, stockControlled: i.variant.stockControlled }, designId: i.designId })) } : { items: [] });
    }
    if (path[0] === "addresses") return privateJson(await db.address.findMany({ where: { userId: user.id } }));
    if (path[0] === "orders") return privateJson(await db.order.findMany({ where: { userId: user.id }, include: { items: true, history: { orderBy: { createdAt: "asc" } } }, orderBy: { createdAt: "desc" } }));
    if (path[0] === "designs") return privateJson(await db.customerDesign.findMany({ where: { userId: user.id }, select: { id: true, productId: true, variantId: true, templateId: true, composition: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 50 }));
    throw new CommerceError("Recurso inexistente.", 404);
  } catch (error) { return fail(error); }
}
export async function POST(request: Request, context: Context) {
  try {
    sameOrigin(request);
    const path = (await context.params).path;
    const raw = (await boundedBody(request, 262144)).toString("utf8");
    let parsed: unknown; try { parsed = JSON.parse(raw); } catch { throw new CommerceError("JSON inválido."); }
    const b = object(parsed);
    if (path[0] === "admin") {
      const resource = path[1], permission = adminPermissions[resource];
      if (!permission) throw new CommerceError("Recurso inexistente.", 404);
      const user = await requirePermission(permission);
      let result: unknown;
      if (resource === "products") {
        if (b.action === "archive") {
          if (b.confirm !== true) throw new CommerceError("Confirme o arquivamento.");
          const id = text(b.id, "Produto", 100);
          result = await db.$transaction(async tx => {
            const p = await tx.product.update({ where: { id }, data: { deletedAt: new Date(), status: "ARCHIVED", revision: { increment: 1 } } });
            await tx.auditLog.create({ data: { actorId: user.id, action: "ARCHIVE", entity: "Product", entityId: id, detail: { name: p.name } } }); return { id };
          });
        } else result = await saveProduct(user.id, b);
      } else if (resource === "categories") result = await saveCategory(user.id, b);
      else if (resource === "variants") result = await saveVariant(user.id, b);
      else if (resource === "templates") result = await saveTemplate(user.id, b);
      else if (resource === "inventory") {
        const variantId = text(b.variantId, "Variação", 100), delta = integer(b.delta, "Movimentação", -1000000, 1000000), reason = text(b.reason, "Motivo", 500);
        if (!delta) throw new CommerceError("Informe uma movimentação diferente de zero.");
        result = await db.$transaction(async tx => {
          const v = await tx.productVariant.findUnique({ where: { id: variantId } });
          if (!v || !v.stockControlled || v.stock + delta < 0) throw new CommerceError("Variação não controlada ou saldo insuficiente.");
          await tx.productVariant.update({ where: { id: variantId }, data: { stock: { increment: delta } } });
          const movement = await tx.inventoryMovement.create({ data: { variantId, delta, reason, actorId: user.id } });
          await tx.auditLog.create({ data: { actorId: user.id, action: "MOVE", entity: "Inventory", entityId: variantId, detail: { delta, reason } } }); return movement;
        }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
      } else if (resource === "orders") {
        await changeOrder(user.id, text(b.id, "Pedido", 100), choice(b.status, ["CONFIRMED", "PRODUCTION", "SHIPPED", "DELIVERED", "CANCELLED"], "Status"), text(b.note, "Nota", 1000)); result = { ok: true };
      } else if (resource === "quotes") {
        const id = text(b.id, "Orçamento", 100), status = choice(b.status, ["NEW", "REVIEWING", "PROPOSED", "ACCEPTED", "REJECTED"], "Status"), note = text(b.note, "Nota", 1000);
        result = await db.$transaction(async tx => {
          const q = await tx.quoteRequest.update({ where: { id }, data: { status, history: { create: { status, note, actorId: user.id } } } });
          await tx.auditLog.create({ data: { actorId: user.id, action: "STATUS", entity: "Quote", entityId: id, detail: { status, note } } }); return q;
        });
      } else if (resource === "settings") {
        const data = { businessName: text(b.businessName, "Razão social", 200), contactEmail: text(b.contactEmail, "E-mail", 200, true), purchasePolicy: text(b.purchasePolicy, "Política", 10000, true), orderingEnabled: flag(b.orderingEnabled) };
        result = await db.$transaction(async tx => { const settings = await tx.storeSettings.upsert({ where: { id: "store" }, create: { id: "store", ...data }, update: data }); await tx.auditLog.create({ data: { actorId: user.id, action: "UPDATE", entity: "Settings", entityId: "store", detail: data } }); return settings; });
      } else throw new CommerceError("Operação não permitida.", 405);
      return privateJson(result);
    }
    const user = await requireUser();
    if (path[0] === "cart") {
      if (b.action === "add") return privateJson(await addCart(user.id, text(b.variantId, "Variação", 100), integer(b.quantity, "Quantidade", 1, 10000), text(b.designId, "Projeto", 100, true) || undefined));
      const id = text(b.id, "Item", 100);
      if (b.action === "remove") return privateJson(await db.cartItem.deleteMany({ where: { id, cart: { userId: user.id } } }));
      const quantity = integer(b.quantity, "Quantidade", 1, 10000);
      await db.$transaction(async tx => {
        const item = await tx.cartItem.findFirst({ where: { id, cart: { userId: user.id } }, include: { product: true, variant: true } });
        if (!item || quantity < item.product.minimumQuantity || (item.variant.stockControlled && quantity > item.variant.stock)) throw new CommerceError("Quantidade inválida ou indisponível.");
        await tx.cartItem.update({ where: { id }, data: { quantity } });
      }); return privateJson({ ok: true });
    }
    if (path[0] === "addresses") {
      const postalCode = text(b.postalCode, "CEP", 8), state = text(b.state, "UF", 2).toUpperCase();
      if (!/^\d{8}$/.test(postalCode) || !/^(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)$/.test(state)) throw new CommerceError("CEP ou UF inválidos.");
      return privateJson(await db.address.create({ data: { userId: user.id, recipient: text(b.recipient, "Destinatário", 180), postalCode, street: text(b.street, "Rua", 180), number: text(b.number, "Número", 30), complement: text(b.complement, "Complemento", 100, true), district: text(b.district, "Bairro", 100), city: text(b.city, "Cidade", 100), state } }));
    }
    if (path[0] === "orders") return privateJson(await placeOrder(user.id, text(b.addressId, "Endereço", 100), text(b.requestKey, "Solicitação", 100)));
    if (path[0] === "quotes") {
      const product = await db.product.findFirst({ where: { id: text(b.productId, "Produto", 100), ...activeProductWhere }, include: { options: true } });
      if (!product || product.mode !== "QUOTE_ONLY") throw new CommerceError("Produto não disponível para orçamento.");
      const quantity = integer(b.quantity, "Quantidade", product.minimumQuantity, 100000), options = object(b.options ?? {}), clean: Record<string,string> = {};
      for (const option of product.options) { const v = options[option.name]; if (v !== undefined && v !== "") { const value = text(v, "Opção", 100); if (!Array.isArray(option.values) || !option.values.includes(value)) throw new CommerceError("Opção inválida."); clean[option.name] = value; } }
      return privateJson(await db.quoteRequest.create({ data: { userId: user.id, message: text(b.message, "Mensagem", 3000), items: { create: { productId: product.id, quantity, options: clean, snapshot: { name: product.name, sku: product.sku } } }, history: { create: { status: "NEW", actorId: user.id, note: "Solicitação recebida." } } } }));
    }
    if (path[0] === "designs") {
      const product = await db.product.findFirst({ where: { id: text(b.productId, "Produto", 100), mode: "CUSTOMIZABLE", ...activeProductWhere } });
      const template = await db.customizationTemplate.findFirst({ where: { id: text(b.templateId, "Vista", 100), productId: product?.id ?? "", active: true }, include: { areas: true } });
      const variant = await db.productVariant.findFirst({ where: { id: text(b.variantId, "Variação", 100), productId: product?.id ?? "", active: true } });
      if (!product || !template || !variant) throw new CommerceError("Modelo ou variação inválidos.");
      const elements = composition(b.composition, template.areas);
      if (!elements.length) throw new CommerceError("Adicione pelo menos um elemento.");
      for (const element of elements.filter(e => e.type === "image")) if (!await db.storedAsset.findFirst({ where: { id: element.value.split("/").pop(), ownerId: user.id, bytes: { lte: template.maxFileBytes } } })) throw new CommerceError("Arquivo não autorizado ou excede o limite do modelo.");
      return privateJson(await db.customerDesign.create({ data: { userId: user.id, productId: product.id, variantId: variant.id, templateId: template.id, composition: elements as unknown as Prisma.InputJsonArray, templateSnapshot: { baseImageUrl: template.baseImageUrl, name: template.name, areas: template.areas } } }));
    }
    throw new CommerceError("Recurso inexistente.", 404);
  } catch (error) { return fail(error); }
}
