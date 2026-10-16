import sharp from "sharp";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { allowed, CommerceError, requireUser, sameOrigin } from "@/lib/commerce/auth";
import { assetStorage, boundedBody, validateImageContent } from "@/lib/commerce/storage";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    sameOrigin(request); const user = await requireUser();
    const bytes = await boundedBody(request, 5242880 + 65536);
    const form = await new Request(request.url, { method: "POST", headers: { "content-type": request.headers.get("content-type") ?? "" }, body: bytes }).formData();
    const purpose = String(form.get("purpose") ?? "design");
    if (!["catalog", "mockup", "design", "artwork"].includes(purpose)) throw new CommerceError("Finalidade inválida.");
    const file = form.get("file"), isPublic = purpose !== "design" && purpose !== "artwork";
    if ((isPublic || purpose === "artwork") && !allowed(user.role, "products")) throw new CommerceError("Upload de catálogo não autorizado.", 403);
    const productId = form.get("productId");
    if (productId && (typeof productId !== "string" || !isPublic || !await db.product.findFirst({ where: { id: productId, deletedAt: null }, select: { id: true } }))) throw new CommerceError("Produto inválido.");
    if (!(file instanceof File) || !file.size || file.size > 5242880) throw new CommerceError("Limite de arquivo: 5 MB.");
    if (await db.storedAsset.count({ where: { ownerId: user.id } }) > (purpose === "artwork" ? 498 : 499)) throw new CommerceError("Limite de arquivos atingido. Contate a loja.", 429);
    if (await db.storedAsset.count({ where: { ownerId: user.id, createdAt: { gt: new Date(Date.now() - 60000) } } }) >= 10) throw new CommerceError("Aguarde um minuto antes de enviar mais imagens.", 429);
    const quota = await db.storedAsset.aggregate({ where: { ownerId: user.id }, _sum: { bytes: true } });
    if ((quota._sum.bytes ?? 0) + file.size > 104857600) throw new CommerceError("Limite de armazenamento de 100 MB atingido. Contate a loja.", 429);
    const data = new Uint8Array(await file.arrayBuffer()), mime = await validateImageContent(data, file.type);
    const metadata = await sharp(data).metadata();
    const swapAxes = (metadata.orientation ?? 0) >= 5;
    const pixelWidth = swapAxes ? metadata.height : metadata.width, pixelHeight = swapAxes ? metadata.width : metadata.height;
    const preview = purpose === "artwork" ? await sharp(data).rotate().resize({ width: 480, height: 480, fit: "inside", withoutEnlargement: true }).webp().toBuffer() : null;
    if ((quota._sum.bytes ?? 0) + data.length + (preview?.length ?? 0) > 104857600) throw new CommerceError("Limite de armazenamento atingido.", 429);
    const storageKey = await assetStorage.put(data, { mime, public: isPublic, ownerId: user.id, productId: typeof productId === "string" ? productId : undefined, purpose });
    let asset;
    try { asset = await db.storedAsset.create({ data: { storageKey, mime, bytes: data.length, pixelWidth, pixelHeight, ownerId: user.id, public: isPublic } }); }
    catch {
      // A connection error can make INSERT completion ambiguous. Never delete here:
      // it could remove an object whose metadata actually committed.
      console.warn("Upload sem confirmação de metadados: revisão de órfãos necessária.");
      throw new CommerceError("Não foi possível registrar a imagem. Upload não confirmado.", 503);
    }
    let thumbnailAssetId: string | undefined;
    if (preview) {
      const key = await assetStorage.put(preview, { mime: "image/webp", public: true, ownerId: user.id, purpose: "artwork-preview" });
      const thumb = await db.storedAsset.create({ data: { storageKey: key, mime: "image/webp", bytes: preview.length, ownerId: user.id, public: true } });
      thumbnailAssetId = thumb.id;
    }
    return NextResponse.json({ id: asset.id, url: '/api/arquivos/'+asset.id, pixelWidth, pixelHeight, thumbnailAssetId });
  } catch (e) { return NextResponse.json({ error: e instanceof CommerceError ? e.message : "Não foi possível salvar a imagem." }, { status: e instanceof CommerceError ? e.status : 503 }); }
}
