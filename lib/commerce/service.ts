import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { CommerceError } from "./auth";
import { integer, price } from "./validation";

export const productInclude = { images: { orderBy: { position: "asc" as const } }, variants: { where: { active: true } }, category: true, options: true, templates: { where: { active: true }, include: { areas: true } } };
export const publicProductSelect = {
  id: true, name: true, slug: true, shortDescription: true, description: true, mode: true,
  priceCents: true, salePriceCents: true, minimumQuantity: true, leadDays: true, featured: true,
  seoTitle: true, seoDescription: true,
  images: { select: { url: true, alt: true, position: true }, orderBy: { position: "asc" as const } },
  category: { select: { id: true, name: true, slug: true } },
  variants: { where: { active: true }, select: { id: true, name: true, attributes: true, priceCents: true, stock: true, stockControlled: true } },
  options: { select: { name: true, values: true } },
  templates: { where: { active: true }, select: { id: true, name: true, productType: true, variantIds: true, baseImageUrl: true, maxFileBytes: true, areas: true } },
} satisfies Prisma.ProductSelect;
export const activeProductWhere = { status: "ACTIVE" as const, deletedAt: null, category: { active: true, OR: [{ parentId: null }, { parent: { active: true } }] } };
export async function cartFor(userId: string) {
  return db.cart.findUnique({ where: { userId }, include: { items: { include: { product: { include: { category: true } }, variant: true, design: true } } } });
}
export async function addCart(userId: string, variantId: string, quantity: number, designId?: string) {
  integer(quantity, "Quantidade", 1, 10000);
  return db.$transaction(async tx => {
    const variant = await tx.productVariant.findUnique({ where: { id: variantId }, include: { product: { include: { category: { include: { parent: true } } } } } });
    if (!variant || !variant.active) throw new CommerceError("Variação indisponível.");
    const p = variant.product;
    if (p.status !== "ACTIVE" || p.deletedAt || !p.category.active || (p.category.parent && !p.category.parent.active) || p.mode === "QUOTE_ONLY" || p.category.slug === "uniformes" || p.category.parent?.slug === "uniformes") throw new CommerceError("Produto não disponível para compra.");
    if (quantity < p.minimumQuantity) throw new CommerceError(`Quantidade mínima: ${p.minimumQuantity}.`);
    price(p, variant);
    if (p.mode === "CUSTOMIZABLE") {
      const design = designId && await tx.customerDesign.findFirst({ where: { id: designId, userId, productId: p.id, variantId } });
      if (!design) throw new CommerceError("Salve uma personalização desta variação antes de continuar.");
    } else if (designId) throw new CommerceError("Este produto não aceita personalização.");
    const cart = await tx.cart.upsert({ where: { userId }, create: { userId }, update: {} });
    const existing = await tx.cartItem.findFirst({ where: { cartId: cart.id, variantId, designId: designId ?? null } });
    const total = quantity + (existing?.quantity ?? 0);
    if (total > 10000 || (variant.stockControlled && total > variant.stock)) throw new CommerceError("Estoque ou quantidade insuficiente.");
    if (existing) return tx.cartItem.update({ where: { id: existing.id }, data: { quantity: total } });
    return tx.cartItem.create({ data: { cartId: cart.id, productId: p.id, variantId, designId, quantity } });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}
export async function placeOrder(userId: string, addressId: string, requestKey: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestKey)) throw new CommerceError("Identificador de solicitação inválido.");
  return db.$transaction(async tx => {
    const previous = await tx.order.findUnique({ where: { requestKey } });
    if (previous) { if (previous.userId !== userId) throw new CommerceError("Solicitação inválida."); return previous; }
    const settings = await tx.storeSettings.findUnique({ where: { id: "store" } });
    if (!settings?.orderingEnabled) throw new CommerceError("Recebimento de pedidos ainda não habilitado pela loja.");
    const address = await tx.address.findFirst({ where: { id: addressId, userId } });
    if (!address) throw new CommerceError("Selecione um endereço da sua conta.");
    const cart = await tx.cart.findUnique({ where: { userId }, include: { items: { include: { product: { include: { category: { include: { parent: true } } } }, variant: true, design: true } } } });
    if (!cart?.items.length) throw new CommerceError("Carrinho vazio.");
    let subtotalCents = 0;
    const items = [];
    for (const item of cart.items) {
      const { product: p, variant: v, design } = item;
      if (p.status !== "ACTIVE" || p.deletedAt || !p.category.active || (p.category.parent && !p.category.parent.active) || (p.mode === "QUOTE_ONLY" || p.category.slug === "uniformes" || p.category.parent?.slug === "uniformes") || !v.active || item.quantity < p.minimumQuantity) throw new CommerceError("Um item não está mais disponível.");
      if (p.mode === "CUSTOMIZABLE" && (!design || design.userId !== userId || design.variantId !== v.id)) throw new CommerceError("Personalização inválida.");
      const unitPriceCents = price(p, v);
      subtotalCents += unitPriceCents * item.quantity;
      integer(subtotalCents, "Total", 0, 100000000);
      if (v.stockControlled) {
        const changed = await tx.productVariant.updateMany({ where: { id: v.id, stock: { gte: item.quantity } }, data: { stock: { decrement: item.quantity } } });
        if (changed.count !== 1) throw new CommerceError(`Estoque insuficiente: ${p.name}.`);
      }
      items.push({ productId: p.id, variantId: v.id, quantity: item.quantity, unitPriceCents, snapshot: { name: p.name, sku: v.sku, attributes: v.attributes, mode: p.mode, stockReserved: v.stockControlled, design: design ? { id: design.id, composition: design.composition, template: design.templateSnapshot } : null } });
    }
    const order = await tx.order.create({ data: { userId, requestKey, subtotalCents, totalCents: subtotalCents, addressSnapshot: { recipient: address.recipient, postalCode: address.postalCode, street: address.street, number: address.number, complement: address.complement, district: address.district, city: address.city, state: address.state }, items: { create: items }, history: { create: { status: "PENDING", actorId: userId, note: "Pedido recebido. Frete e pagamento pendentes de integração; total de mercadorias." } } } });
    for (const item of cart.items) if (item.variant.stockControlled) await tx.inventoryMovement.create({ data: { variantId: item.variantId, delta: -item.quantity, reason: "Reserva na criação do pedido", actorId: userId, orderId: order.id } });
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    return order;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}
export async function changeOrder(actorId: string, id: string, status: "CONFIRMED" | "PRODUCTION" | "SHIPPED" | "DELIVERED" | "CANCELLED", note: string, artReviewed = false) {
  const transitions: Record<string, string[]> = { PENDING: ["CONFIRMED", "CANCELLED"], CONFIRMED: ["PRODUCTION", "CANCELLED"], PRODUCTION: ["SHIPPED", "CANCELLED"], SHIPPED: ["DELIVERED"], DELIVERED: [], CANCELLED: [] };
  return db.$transaction(async tx => {
    const order = await tx.order.findUnique({ where: { id }, include: { items: { include: { variant: true } } } });
    if (!order || !transitions[order.status].includes(status)) throw new CommerceError("Transição de pedido não permitida.");
    if (status === "PRODUCTION" && order.items.some(i => { const snapshot=i.snapshot as Record<string,unknown>; return !!snapshot.design; }) && !artReviewed) throw new CommerceError("Confirme a conferência da arte, medidas e arquivos originais antes da produção.");
    if (status === "PRODUCTION" && artReviewed) note = "[ARTE CONFERIDA] " + note;
    if (status === "CANCELLED") for (const item of order.items) if (item.snapshot && typeof item.snapshot === "object" && !Array.isArray(item.snapshot) && item.snapshot.stockReserved === true) {
      await tx.productVariant.update({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } });
      await tx.inventoryMovement.create({ data: { variantId: item.variantId, delta: item.quantity, actorId, orderId: id, reason: "Devolução de reserva por cancelamento" } });
    }
    await tx.order.update({ where: { id }, data: { status, history: { create: { status, actorId, note } } } });
    await tx.auditLog.create({ data: { actorId, action: "STATUS", entity: "Order", entityId: id, detail: { from: order.status, to: status, note } } });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}
