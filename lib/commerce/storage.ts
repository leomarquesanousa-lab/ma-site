import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { CommerceError } from "./errors";
import { r2Request } from "./r2";
import sharp from "sharp";
import { readLibraryAsset } from './r2-library-source';
import { createHash } from 'node:crypto';
const root = path.join(process.cwd(), ".ma-storage");
type UploadContext = { mime: string; public: boolean; ownerId: string; productId?: string; purpose: string };
export interface AssetStorage { put(bytes: Uint8Array, context: UploadContext): Promise<string>; get(key: string): Promise<Uint8Array>; }
export const assetStorage: AssetStorage = {
  async put(bytes, context) {
    const provider = process.env.ASSET_STORAGE ?? (process.env.NODE_ENV === "production" ? "r2" : "local");
    if (provider === "r2") {
      const scope = context.productId ? `products/${context.productId}` : `drafts/${context.ownerId}`;
      if (!/^[a-zA-Z0-9/_-]+$/.test(scope)) throw new CommerceError("Destino de arquivo inválido.");
      const testPrefix = process.env.MA_HOMOLOGATION === "1" ? `${process.env.R2_TEST_PREFIX}/` : "";
      const key = `${context.public ? "public" : "private"}/${testPrefix}${scope}/${context.purpose}/${randomUUID()}`;
      await r2Request("PUT", key, bytes, context.mime);
      return `r2:${key}`;
    }
    if (provider !== "local" || process.env.NODE_ENV === "production") throw new CommerceError("Armazenamento não configurado.", 503);
    await mkdir(root, { recursive: true }); const key = randomUUID(); await writeFile(path.join(root, key), bytes, { flag: "wx", mode: 0o600 }); return key;
  },
  async get(key) {
    if(key.startsWith('r2art:'))return readLibraryAsset(key);
    if(key.startsWith('r2thumb:')){
      const cacheDir=path.join(root,'library-previews'),file=path.join(cacheDir,createHash('sha256').update(key).digest('hex')+'.webp');
      try{return new Uint8Array(await readFile(file));}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}
      const data=await readLibraryAsset(key),mime=imageMime(data);await validateImageContent(data,mime);
      const thumbnail=await sharp(data,{limitInputPixels:40000000}).rotate().resize({width:640,height:640,fit:'inside',withoutEnlargement:true}).webp().toBuffer();
      await mkdir(cacheDir,{recursive:true});await writeFile(file,thumbnail,{mode:0o600});return new Uint8Array(thumbnail);
    }
    if (key.startsWith("r2:")) return new Uint8Array(await (await r2Request("GET", key.slice(3))).arrayBuffer());
    if (!/^[0-9a-f-]{36}$/.test(key)) throw new CommerceError("Arquivo inexistente.", 404); return readFile(path.join(root, key));
  },
};
export async function boundedBody(request: Request, limit: number) {
  if (Number(request.headers.get("content-length") ?? 0) > limit) throw new CommerceError("Arquivo ou solicitação excede o limite.", 413);
  const reader = request.body?.getReader(); if (!reader) throw new CommerceError("Conteúdo vazio.");
  let size = 0; const chunks: Uint8Array[] = [];
  try { while (true) { const part = await reader.read(); if (part.done) break; size += part.value.length; if (size > limit) { await reader.cancel(); throw new CommerceError("Conteúdo excede o limite.", 413); } chunks.push(part.value); } } finally { reader.releaseLock(); }
  return Buffer.concat(chunks);
}
export function imageMime(bytes: Uint8Array) {
  const b = Buffer.from(bytes);
  const dimensions = (width: number, height: number) => {
    if (!width || !height || width > 10000 || height > 10000 || width * height > 40000000) throw new CommerceError("Imagem com dimensões inválidas ou excessivas.");
  };
  if (b.length > 24 && b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) {
    dimensions(b.readUInt32BE(16), b.readUInt32BE(20));
    return "image/png";
  }
  if (b.length > 12 && b[0] === 255 && b[1] === 216 && b[2] === 255) {
    let offset = 2;
    while (offset + 9 < b.length) {
      if (b[offset] !== 255) break;
      const marker = b[offset + 1];
      if (marker === 255) { offset++; continue; }
      if (marker === 0xda || marker === 0xd9) break;
      const length = b.readUInt16BE(offset + 2);
      if (length < 2 || offset + 2 + length > b.length) break;
      if ([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)) {
        dimensions(b.readUInt16BE(offset + 7), b.readUInt16BE(offset + 5)); return "image/jpeg";
      }
      offset += length + 2;
    }
    throw new CommerceError("JPEG inválido.");
  }
  if (b.length > 30 && b.toString("ascii",0,4) === "RIFF" && b.toString("ascii",8,12) === "WEBP") {
    const chunk = b.toString("ascii",12,16);
    if (chunk === "VP8X") dimensions(1 + b.readUIntLE(24,3), 1 + b.readUIntLE(27,3));
    else if (chunk === "VP8L" && b[20] === 0x2f) dimensions(1 + (((b[22]&0x3f)<<8)|b[21]), 1 + (((b[24]&0xf)<<10)|(b[23]<<2)|(b[22]>>6)));
    else if (chunk === "VP8 " && b[23] === 0x9d && b[24] === 1 && b[25] === 0x2a) dimensions(b.readUInt16LE(26)&0x3fff,b.readUInt16LE(28)&0x3fff);
    else throw new CommerceError("WebP inválido.");
    return "image/webp";
  }
  throw new CommerceError("Envie PNG, JPEG ou WebP. SVG e arquivos executáveis não são permitidos.");
}
export async function validateImageContent(bytes: Uint8Array, expectedMime: string) {
  const mime = imageMime(bytes);
  if (mime !== expectedMime) throw new CommerceError("Tipo do arquivo não corresponde ao conteúdo.");
  try {
    const image = sharp(bytes, { limitInputPixels: 40000000, failOn: "warning" });
    const metadata = await image.metadata();
    if ((metadata.pages ?? 1) !== 1) throw new Error();
    await image.stats(); // Decode pixels, not only magic bytes or metadata.
  } catch { throw new CommerceError("Imagem corrompida, animada ou com conteúdo inválido."); }
  return mime;
}
