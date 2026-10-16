import { db } from "@/lib/db";
import { allowed, currentUser } from "@/lib/commerce/auth";
import { assetStorage } from "@/lib/commerce/storage";
export const runtime = "nodejs";
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const asset = await db.storedAsset.findUnique({ where: { id: (await params).id } });
    if (!asset) return new Response(null, { status: 404 });
    if (!asset.public) {
      const user = await currentUser();
      if (!user || user.mustChangePassword) return new Response(null, { status: 404 });
      if (user.id !== asset.ownerId) {
        const libraryOriginal = allowed(user.role, "products") && await db.artwork.findFirst({ where: { originalAssetId: asset.id }, select: { id: true } });
        if (!libraryOriginal) {
        if (!allowed(user.role, "orders")) return new Response(null, { status: 404 });
        const ordered = await db.orderItem.findFirst({ where: { OR: [{ snapshot: { path: ["design", "composition"], array_contains: [{ value: `/api/arquivos/${asset.id}` }] } }, { snapshot: { path: ["design", "composition"], array_contains: [{ sourceAssetId: asset.id }] } }] }, select: { id: true } });
        if (!ordered) return new Response(null, { status: 404 });
        }
      }
    }
    const bytes = await assetStorage.get(asset.storageKey);
    return new Response(new Uint8Array(bytes), { headers: { "Content-Type": asset.mime, "X-Content-Type-Options": "nosniff", "Content-Disposition": "inline", "Cache-Control": asset.public ? "public, max-age=3600" : "private, no-store", "Content-Security-Policy": "default-src 'none'; sandbox" } });
  } catch { return new Response(null, { status: 404 }); }
}
