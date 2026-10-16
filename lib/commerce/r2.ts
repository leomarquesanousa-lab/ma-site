import { createHash, createHmac } from "node:crypto";
import { CommerceError } from "./errors";

// R2 S3 Signature V4. Never return credentials, endpoint errors or signed requests.
const hash = (value: string | Uint8Array) => createHash("sha256").update(value).digest("hex");
const hmac = (key: string | Buffer, value: string) => createHmac("sha256", key).update(value).digest();
export async function r2Request(method: "PUT" | "GET", key: string, bytes?: Uint8Array, mime?: string) {
  if (process.env.MA_HOMOLOGATION === "1") {
    const prefix = process.env.R2_TEST_PREFIX;
    if (!prefix || !/^homologacao\/[a-z0-9-]{8,48}$/.test(prefix) || !["public", "private"].some(scope => key.startsWith(`${scope}/${prefix}/`))) throw new CommerceError("Objeto fora da área de homologação.", 403);
  }
  const account = process.env.R2_ACCOUNT_ID;
  const access = process.env.R2_ACCESS_KEY_ID;
  const secret = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  if (!account || !/^[a-f0-9]{32}$/.test(account) || !access || !secret || !bucket || !/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(bucket)) {
    throw new CommerceError("R2 da MA Confecções não configurado. Upload indisponível.", 503);
  }
  if (!/^(public|private)\/[a-zA-Z0-9/_-]+$/.test(key) || key.includes("..")) throw new CommerceError("Objeto inválido.");
  const host = `${account}.r2.cloudflarestorage.com`;
  const uri = `/${bucket}/${key}`;
  const date = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
  const day = date.slice(0, 8), scope = `${day}/auto/s3/aws4_request`;
  const payloadHash = hash(bytes ?? "");
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
  const canonical = `${method}\n${uri}\n\nhost:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${date}\n\n${signedHeaders}\n${payloadHash}`;
  const signingKey = hmac(hmac(hmac(hmac(`AWS4${secret}`, day), "auto"), "s3"), "aws4_request");
  const signature = createHmac("sha256", signingKey).update(`AWS4-HMAC-SHA256\n${date}\n${scope}\n${hash(canonical)}`).digest("hex");
  const headers: Record<string, string> = {
    Authorization: `AWS4-HMAC-SHA256 Credential=${access}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    "x-amz-date": date, "x-amz-content-sha256": payloadHash,
  };
  if (mime) headers["Content-Type"] = mime;
  if (method === "PUT") headers["If-None-Match"] = "*";
  try {
    const response = await fetch(`https://${host}${uri}`, { method, headers, body: bytes ? new Uint8Array(bytes) : undefined, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error();
    return response;
  } catch { throw new CommerceError("Armazenamento R2 indisponível. Nenhum upload foi confirmado.", 503); }
}
