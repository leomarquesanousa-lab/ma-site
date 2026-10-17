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
export function productSummary(value:unknown):string {
  if(value===undefined||value===null)return '';
  if(typeof value!=='string')throw new CommerceError('Resumo: informe um texto válido ou deixe o campo vazio.');
  const summary=value.trim();
  if(summary.length>500)throw new CommerceError(`Resumo: use no máximo 500 caracteres (recebidos ${summary.length}).`);
  return summary;
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
export function categoryImageUrl(value: unknown) {
  const source = text(value, "Imagem da categoria", 2000);
  if (source.startsWith("//")) throw new CommerceError("Informe a URL completa, começando com HTTPS.");
  if (!/^https:\/\//i.test(source)) return imageUrl(source);
  if (/[\u0000-\u0020\u007f\\]/.test(source)) throw new CommerceError("A URL contém caracteres inválidos. Use um endereço HTTPS completo.");
  let url: URL;
  try { url = new URL(source); } catch { throw new CommerceError("Informe uma URL HTTPS válida para a imagem."); }
  if (url.protocol !== "https:" || !url.hostname || url.username || url.password) throw new CommerceError("Use uma URL HTTPS sem usuário ou senha.");
  const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
  if (!hostname.includes(".") || hostname.includes(":") || /^\d+\.\d+\.\d+\.\d+$/.test(hostname) || /(^|\.)(localhost|local|internal)$/.test(hostname)) throw new CommerceError("Use um domínio público HTTPS, sem endereços IP ou hosts locais.");
  return url.href;
}
export const statuses = ["DRAFT", "ACTIVE", "INACTIVE", "ARCHIVED"] as const;
export function price(product: { priceCents: number | null; salePriceCents: number | null }, variant: { priceCents: number | null }) {
  const cents = variant.priceCents ?? product.salePriceCents ?? product.priceCents;
  if (cents == null) throw new CommerceError("Preço não configurado.");
  return integer(cents, "Preço");
}
export function formatMoney(cents: number) { return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
export const studioFonts = ["Arial", "Georgia", "Verdana", "Courier New"] as const;
export type DesignElement = { applicationMode?:'FULL_WRAP'|'FULL_WRAP_COVER'|'SAFE_CONTAIN'|'CENTERED'; imageBackground?:string; imageCrop?:{x:number;y:number;width:number;height:number}; templateId?: string; fontFamily?: string; artworkId?: string; presetIndex?: number; locked?: boolean; pixelWidth?: number; pixelHeight?: number; sourceAssetId?: string; id: string; areaId: string; type: "text" | "image"; value: string; x: number; y: number; width: number; height: number; rotation: number; color: string };
export type PrintArea = { id: string; x: number; y: number; width: number; height: number; allowText: boolean; allowImage: boolean; printWidthMm?: number | null; printHeightMm?: number | null };
export function composition(value: unknown, areas: PrintArea[]): DesignElement[] {
  const ids = new Set<string>();
  return list(value, "Composição", 30).map((raw) => {
    const e = object(raw); if(ids.has(String(e.id)))throw new CommerceError("Elemento duplicado."); ids.add(String(e.id)); const area = areas.find(a => a.id === e.areaId);
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
    const applicationMode=e.applicationMode==null?undefined:choice(e.applicationMode,['FULL_WRAP','FULL_WRAP_COVER','SAFE_CONTAIN','CENTERED'],'Aplicação');
    let imageCrop:DesignElement['imageCrop'];
    if(e.imageCrop!=null){const crop=object(e.imageCrop);if(type!=='image'||['x','y','width','height'].some(key=>typeof crop[key]!=='number'||!Number.isFinite(crop[key])||Number(crop[key])<0||Number(crop[key])>1)||Number(crop.width)<=0||Number(crop.height)<=0||Number(crop.x)+Number(crop.width)>1+1e-9||Number(crop.y)+Number(crop.height)>1+1e-9)throw new CommerceError('Recorte da imagem inválido.');imageCrop={x:Number(crop.x),y:Number(crop.y),width:Number(crop.width),height:Number(crop.height)};}
    if(applicationMode&&type!=='image')throw new CommerceError('Modo de aplicação reservado a imagens.');
    if((applicationMode==='FULL_WRAP'||applicationMode==='FULL_WRAP_COVER')&&!imageCrop)throw new CommerceError('FULL_WRAP exige um recorte válido.');
    const imageBackground=e.imageBackground==null?undefined:text(e.imageBackground,'Fundo',7);if(imageBackground&&(!/^#[0-9a-f]{6}$/i.test(imageBackground)||type!=='image'))throw new CommerceError('Fundo da imagem inv\u00e1lido.');
    if(applicationMode==='SAFE_CONTAIN'&&imageCrop)throw new CommerceError('SAFE_CONTAIN n\u00e3o permite recorte.');
    return { ...(imageBackground?{imageBackground}:{}),...(applicationMode?{applicationMode}:{}),...(imageCrop?{imageCrop}:{}),...(e.templateId ? {templateId:text(e.templateId,"Vista",100)} : {}), ...(e.artworkId ? {artworkId:text(e.artworkId,"Arte",100)} : {}), ...(e.presetIndex != null ? {presetIndex:integer(e.presetIndex,"Elemento do modelo",0,9)} : {}), fontFamily: choice(e.fontFamily ?? "Arial", studioFonts, "Fonte"), id: text(e.id, "Elemento", 80), areaId: area.id, type, value: content, x, y, width, height, rotation, color };
  });
}
