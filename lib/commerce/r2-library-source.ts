import { readFile } from 'node:fs/promises';
import { parseEnv } from 'node:util';
import { CommerceError } from './errors';
import { r2Read, type R2ReadCredentials } from './r2';

export type LibraryObject={key:string;etag:string;size:number};
// Reading these four keys does not load DATABASE_URL or alter process.env.
export async function libraryCredentials():Promise<R2ReadCredentials>{
 let values:Record<string,string|undefined>=process.env;
 if(process.env.MA_LOCAL_DEVELOPMENT==='1'){
  try{values=parseEnv(await readFile('.env.artes-r2','utf8'));}
  catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;values=parseEnv(await readFile('.env','utf8'));}
 }
 return {account:values.R2_ACCOUNT_ID??'',access:values.R2_ACCESS_KEY_ID??'',secret:values.R2_SECRET_ACCESS_KEY??'',bucket:values.R2_BUCKET??''};
}
export function decodeXml(value:string){return value.replace(/&(quot|apos|lt|gt|amp);/g,(_,entity)=>({quot:'"',apos:"'",lt:'<',gt:'>',amp:'&'}[entity as 'amp'])!);}
export function parseLibraryPage(xml:string){
 if(!xml.includes('<ListBucketResult'))throw new CommerceError('Resposta de catálogo R2 inválida.',503);
 const tag=(s:string,name:string)=>decodeXml(s.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`))?.[1]??'');
 const objects:LibraryObject[]=[];
 for(const match of xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)){
  const key=decodeURIComponent(tag(match[1],'Key')),size=Number(tag(match[1],'Size')),etag=tag(match[1],'ETag');
  if(!key.startsWith('artes/')||!Number.isSafeInteger(size)||size<0||!etag)throw new CommerceError('Objeto de catálogo inválido.',503);
  objects.push({key,size,etag});
 }
 const truncated=tag(xml,'IsTruncated')==='true',next=tag(xml,'NextContinuationToken');
 if(truncated&&!next)throw new CommerceError('Paginação R2 incompleta.',503);
 return {objects,next:truncated?next:''};
}
export async function listLibraryObjects(){
 const credentials=await libraryCredentials(),objects:LibraryObject[]=[],tokens=new Set<string>();let token='';
 do{
  const response=await r2Read(credentials,'',{'list-type':'2',prefix:'artes/','encoding-type':'url','max-keys':'1000',...(token?{'continuation-token':token}:{})});
  const xml=new TextDecoder().decode(await limitedBytes(response,8*1024*1024));
  const page=parseLibraryPage(xml);objects.push(...page.objects);token=page.next;
  if(token&&tokens.has(token))throw new CommerceError('Paginação R2 repetida.',503);tokens.add(token);
  if(objects.length>100000)throw new CommerceError('Catálogo acima do limite de segurança de 100 mil objetos.',503);
 }while(token);
 const unique=new Map<string,LibraryObject>();
 for(const object of objects){const previous=unique.get(object.key);if(previous&&previous.etag!==object.etag)throw new CommerceError('Catálogo mudou durante a leitura. Sincronize novamente.',409);unique.set(object.key,object);}
 return [...unique.values()];
}
export async function limitedBytes(response:Response,limit:number){
 if(Number(response.headers.get('content-length'))>limit){await response.body?.cancel();throw new CommerceError('Imagem acima do limite permitido.');}
 const reader=response.body?.getReader();if(!reader)throw new CommerceError('Arquivo vazio.');const chunks:Uint8Array[]=[];let size=0;
 try{while(true){const part=await reader.read();if(part.done)break;size+=part.value.length;if(size>limit){await reader.cancel();throw new CommerceError('Arquivo acima do limite permitido.');}chunks.push(part.value);}}finally{reader.releaseLock();}
 return Buffer.concat(chunks);
}
export function libraryAssetKey(object:LibraryObject,thumbnail=false){return `${thumbnail?'r2thumb:':'r2art:'}${Buffer.from(JSON.stringify({key:object.key,etag:object.etag})).toString('base64url')}`;}
export async function readLibraryAsset(storageKey:string){
 const prefix=storageKey.startsWith('r2thumb:')?'r2thumb:':'r2art:';
 let ref:{key:string;etag:string};try{ref=JSON.parse(Buffer.from(storageKey.slice(prefix.length),'base64url').toString());if(typeof ref.key!=='string'||typeof ref.etag!=='string'||!ref.etag)throw Error();}catch{throw new CommerceError('Referência de arte inválida.',404);}
 return limitedBytes(await r2Read(await libraryCredentials(),ref.key,{},ref.etag),20*1024*1024);
}
