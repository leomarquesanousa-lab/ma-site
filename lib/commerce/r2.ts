import { createHash, createHmac } from "node:crypto";
import { CommerceError } from "./errors";

// R2 S3 Signature V4. Never return credentials, endpoint errors or signed requests.
const hash = (value: string | Uint8Array) => createHash("sha256").update(value).digest("hex");
const hmac = (key: string | Buffer, value: string) => createHmac("sha256", key).update(value).digest();
export type R2ReadCredentials = { account: string; access: string; secret: string; bucket: string };
// Library access has no write method. It never changes the upload provider.
export async function r2Read(credentials: R2ReadCredentials, key = "", query: Record<string,string> = {}, etag?: string) {
  const {account,access,secret,bucket}=credentials;
  if(!/^[a-f0-9]{32}$/.test(account)||!access||!secret||!/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(bucket))throw new CommerceError("Configure a leitura da biblioteca R2.",503);
  if(key && (!key.startsWith('artes/')||key.split('/').some(p=>p==='..'||p==='.')||/[\x00-\x1f]/.test(key)))throw new CommerceError('Arte fora da biblioteca.',403);
  if(!key && (query['list-type']!=='2'||!query.prefix?.startsWith('artes/')))throw new CommerceError('Listagem fora da biblioteca.',403);
  const encode=(s:string)=>encodeURIComponent(s).replace(/[!'()*]/g,c=>'%'+c.charCodeAt(0).toString(16).toUpperCase());
  const host=`${account}.r2.cloudflarestorage.com`,uri=`/${bucket}/${key.split('/').map(encode).join('/')}`;
  const search=Object.keys(query).sort().map(k=>`${encode(k)}=${encode(query[k])}`).join('&');
  const date=new Date().toISOString().replace(/[:-]|\.\d{3}/g,''),day=date.slice(0,8),scope=`${day}/auto/s3/aws4_request`,payloadHash=hash('');
  const signed='host;x-amz-content-sha256;x-amz-date';
  const canonical=`GET\n${uri}\n${search}\nhost:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${date}\n\n${signed}\n${payloadHash}`;
  const signingKey=hmac(hmac(hmac(hmac(`AWS4${secret}`,day),'auto'),'s3'),'aws4_request');
  const signature=createHmac('sha256',signingKey).update(`AWS4-HMAC-SHA256\n${date}\n${scope}\n${hash(canonical)}`).digest('hex');
  try {
    const response=await fetch(`https://${host}${uri}${search?'?'+search:''}`,{method:'GET',headers:{Authorization:`AWS4-HMAC-SHA256 Credential=${access}/${scope}, SignedHeaders=${signed}, Signature=${signature}`,'x-amz-date':date,'x-amz-content-sha256':payloadHash,...(etag?{'If-Match':etag}:{})},redirect:'error',cache:'no-store',signal:AbortSignal.timeout(20000)});
    if(!response.ok){await response.body?.cancel();throw new CommerceError(response.status===403?'R2 negou a leitura. Verifique permissão List/Get da credencial.':response.status===412?'A arte mudou no R2. Sincronize novamente.':'Biblioteca R2 indisponível.',503);}
    return response;
  }catch(e){if(e instanceof CommerceError)throw e;throw new CommerceError('Não foi possível ler a biblioteca R2.',503);}
}
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
