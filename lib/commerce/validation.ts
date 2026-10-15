import { CommerceError } from "./errors";
export function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new CommerceError("Dados inválidos.");
  return value as Record<string, unknown>;
}
export function text(value: unknown, label: string, max = 500, optional = false): string {
  if (optional && (value === undefined || value === null || value === "")) return "";
  if (typeof value !== "string" || !value.trim() || value.trim().length > max) throw new CommerceError(`${label}: valor obrigatório ou inválido.`);
  return value.trim();
}
export function integer(value: unknown, label: string, min = 0, max = 100000000): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < min || value > max) throw new CommerceError(`${label}: número inteiro entre ${min} e ${max}.`);
  return value;
}
export function money(value: unknown, label: string) { return value == null || value === "" ? null : integer(value, label); }
export function choice<T extends string>(value: unknown, choices: readonly T[], label: string): T {
  if (typeof value !== "string" || !choices.includes(value as T)) throw new CommerceError(`${label}: opção inválida.`);
  return value as T;
}
export function list(value: unknown, label: string, max = 50): unknown[] {
  if (!Array.isArray(value) || value.length > max) throw new CommerceError(`${label}: lista inválida.`);
  return value;
}
export function flag(value: unknown) { if (typeof value !== "boolean") throw new CommerceError("Valor booleano inválido."); return value; }
export function slug(value: unknown) { const s = text(value, "Slug", 100); if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s)) throw new CommerceError("Slug: use letras minúsculas, números e hífens."); return s; }
export function imageUrl(value: unknown) {
  const url = text(value, "Imagem", 500);
  if (/^\/[a-zA-Z0-9/_ .-]+\.(png|jpe?g|webp)$/i.test(url) && !url.includes("..")) return url;
  if (/^\/api\/arquivos\/[a-zA-Z0-9_-]+$/.test(url)) return url;
  throw new CommerceError("Use uma imagem local PNG, JPG ou WebP ou um upload autorizado.");
}
export const modes = ["QUOTE_ONLY", "CUSTOMIZABLE", "READY_TO_SELL"] as const;
export const statuses = ["DRAFT", "ACTIVE", "INACTIVE", "ARCHIVED"] as const;
export function price(product: { priceCents: number | null; salePriceCents: number | null }, variant: { priceCents: number | null }) {
  const cents = variant.priceCents ?? product.salePriceCents ?? product.priceCents;
  if (cents == null) throw new CommerceError("Preço não configurado.");
  return integer(cents, "Preço");
}
export function formatMoney(cents: number) { return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
export type DesignElement = { id: string; areaId: string; type: "text" | "image"; value: string; x: number; y: number; width: number; height: number; rotation: number; color: string };
export type PrintArea = { id: string; x: number; y: number; width: number; height: number; allowText: boolean; allowImage: boolean };
export function composition(value: unknown, areas: PrintArea[]): DesignElement[] {
  return list(value, "Composição", 30).map((raw) => {
    const e = object(raw); const area = areas.find(a => a.id === e.areaId);
    if (!area) throw new CommerceError("Área de impressão inválida.");
    const type = choice(e.type, ["text", "image"], "Elemento");
    if ((type === "text" && !area.allowText) || (type === "image" && !area.allowImage)) throw new CommerceError("Tipo de arte não permitido.");
    const n = (key: string) => { const v = e[key]; if (typeof v !== "number" || !Number.isFinite(v)) throw new CommerceError("Coordenadas inválidas."); return v; };
    const x = n("x"), y = n("y"), width = n("width"), height = n("height"), rotation = n("rotation");
    if (width < .01 || height < .01 || Math.abs(rotation) > 180) throw new CommerceError("Dimensão ou rotação inválida.");
    const angle = rotation * Math.PI / 180;
    const bw = Math.abs(width * Math.cos(angle)) + Math.abs(height * Math.sin(angle));
    const bh = Math.abs(width * Math.sin(angle)) + Math.abs(height * Math.cos(angle));
    if (x - bw/2 < area.x - 1e-6 || y - bh/2 < area.y - 1e-6 || x + bw/2 > area.x + area.width + 1e-6 || y + bh/2 > area.y + area.height + 1e-6) throw new CommerceError("A arte ultrapassa a área permitida.");
    const color = text(e.color, "Cor", 7); if (!/^#[0-9a-f]{6}$/i.test(color)) throw new CommerceError("Cor inválida.");
    const content = text(e.value, "Conteúdo", type === "text" ? 200 : 200);
    if (type === "image" && !/^\/api\/arquivos\/[a-zA-Z0-9_-]+$/.test(content)) throw new CommerceError("Imagem não autorizada.");
    return { id: text(e.id, "Elemento", 80), areaId: area.id, type, value: content, x, y, width, height, rotation, color };
  });
}
