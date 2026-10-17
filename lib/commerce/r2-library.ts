import { createHash } from 'node:crypto';
import { db } from '@/lib/db';
import { CommerceError } from './errors';
import { libraryAssetKey, listLibraryObjects, type LibraryObject } from './r2-library-source';

export type FolderMapping={prefix:string;types:string[];active?:boolean;origin?:string;license?:string;authorized?:boolean};
export type LibraryReport={objects:number;indexed:number;ignored:string[];unmapped:string[];empty:string[];prefixes:string[];categories:{path:string;count:number}[];mapping:FolderMapping[];rights:string;syncedAt?:string;artworkIds?:string[]};
const label=(name:string)=>name.replace(/[_-]+/g,' ').trim();
export function classifyObjects(objects:LibraryObject[],mapping:FolderMapping[]){
 const categories=new Map<string,number>(),ignored:string[]=[],unmapped:string[]=[],entries=[];
 for(const object of objects){
  if(object.key.endsWith('/'))continue;
  if(!/\.(png|jpe?g|webp)$/i.test(object.key)||object.size===0){ignored.push(object.key);continue;}
  const parts=object.key.slice('artes/'.length).split('/'),filename=parts.pop()!;
  for(let i=1;i<=parts.length;i++){const path=parts.slice(0,i).map(label).join(' / ');categories.set(path,(categories.get(path)??0)+1);}
  const match=[...mapping].sort((a,b)=>b.prefix.length-a.prefix.length).find(m=>object.key.startsWith(m.prefix));
  if(!match?.types.length)unmapped.push(object.key);
  entries.push({object,name:label(filename.replace(/\.[^.]+$/,'' )).slice(0,180),category:label(parts.shift()??'Outros').slice(0,100),subcategory:parts.map(label).join(' / ').slice(0,100),types:match?.types??[]});
 }
 return {entries,ignored,unmapped,categories:[...categories].map(([path,count])=>({path,count}))};
}
export function parseMapping(raw:unknown):FolderMapping[]{
 if(!Array.isArray(raw)||raw.length>200)throw new CommerceError('Mapeamento inválido.');
 const seen=new Set<string>();return raw.map(m=>{
  if(!m||typeof m.prefix!=='string'||!/^artes\/.+\/$/.test(m.prefix)||m.prefix.split('/').some((p:string)=>p==='..'||p==='.')||seen.has(m.prefix)||!Array.isArray(m.types)||m.types.some((t:unknown)=>!['MUG','SHIRT','PILLOW','TILE'].includes(String(t))))throw new CommerceError('Configure uma pasta válida e seus produtos.');
  if((m.origin&&typeof m.origin!=='string')||(m.license&&typeof m.license!=='string')||(m.origin?.length??0)>500||(m.license?.length??0)>2000)throw new CommerceError('Origem ou licença inválida.');
  seen.add(m.prefix);return {prefix:m.prefix,types:[...new Set<string>(m.types)],active:m.active===true,origin:m.origin?.trim()??'',license:m.license?.trim()??'',authorized:m.authorized===true};
 });
}
export async function libraryOverview(refresh=false){
 const previous=await db.auditLog.findFirst({where:{action:'R2_ART_SYNC'},orderBy:{createdAt:'desc'},select:{detail:true}});
 const report=previous?.detail as LibraryReport|null;
 const config=await db.auditLog.findFirst({where:{action:'R2_ART_CONFIG'},orderBy:{createdAt:'desc'},select:{detail:true}});
 const savedMapping=(config?.detail as {mapping?:FolderMapping[]}|null)?.mapping??report?.mapping??[];
 if(!refresh&&report)return {...report,mapping:savedMapping};
 const objects=await listLibraryObjects(),mapping=savedMapping,classified=classifyObjects(objects,mapping);
 return {objects:objects.length,indexed:await db.artwork.count({where:{id:{startsWith:'r2lib_'},active:true}}),ignored:classified.ignored,unmapped:classified.unmapped,categories:classified.categories,prefixes:[...new Set(objects.map(o=>o.key.slice(0,o.key.lastIndexOf('/')+1)))],mapping,rights:report?.rights??'',empty:objects.filter(o=>o.key.endsWith('/')&&!objects.some(other=>other.key!==o.key&&other.key.startsWith(o.key)&&/\.(png|jpe?g|webp)$/i.test(other.key))).map(o=>o.key)} satisfies LibraryReport;
}
export async function syncLibrary(actorId:string,rawMapping:unknown){
 const mapping=parseMapping(rawMapping);
 const objects=await listLibraryObjects(),classified=classifyObjects(objects,mapping);
 const report:LibraryReport={objects:objects.length,indexed:classified.entries.length,ignored:classified.ignored,unmapped:classified.unmapped,categories:classified.categories,prefixes:[...new Set(objects.map(o=>o.key.slice(0,o.key.lastIndexOf('/')+1)))],mapping,rights:'',syncedAt:new Date().toISOString(),empty:objects.filter(o=>o.key.endsWith('/')&&!objects.some(other=>other.key!==o.key&&other.key.startsWith(o.key)&&/\.(png|jpe?g|webp)$/i.test(other.key))).map(o=>o.key)};
 // One atomic catalog switch after the full paginated listing succeeds. No remote writes.
 return db.$transaction(async tx=>{
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(70943216)`;
  const entries=classified.entries.map(entry=>({...entry,id:'r2lib_'+createHash('sha256').update(entry.object.key).digest('hex'),originalKey:libraryAssetKey(entry.object),thumbnailKey:libraryAssetKey(entry.object,true)}));
  const ids=entries.map(e=>e.id);
  // Batch the initial import: network latency must not multiply by 471 images.
  const batchSize=500;
  const assetData=entries.flatMap(e=>[
   {ownerId:actorId,storageKey:e.originalKey,mime:/\.png$/i.test(e.object.key)?'image/png':/\.webp$/i.test(e.object.key)?'image/webp':'image/jpeg',bytes:e.object.size,public:false},
   {ownerId:actorId,storageKey:e.thumbnailKey,mime:'image/webp',bytes:0,public:true},
  ]);
  for(let i=0;i<assetData.length;i+=batchSize)await tx.storedAsset.createMany({data:assetData.slice(i,i+batchSize),skipDuplicates:true});
  const assets=new Map<string,string>();
  for(let i=0;i<assetData.length;i+=batchSize){
   const rows=await tx.storedAsset.findMany({where:{storageKey:{in:assetData.slice(i,i+batchSize).map(a=>a.storageKey)}},select:{id:true,storageKey:true}});
   rows.forEach(a=>assets.set(a.storageKey,a.id));
  }
  const previous=new Map<string,string>();
  for(let i=0;i<ids.length;i+=batchSize){
   const rows=await tx.artwork.findMany({where:{id:{in:ids.slice(i,i+batchSize)}},select:{id:true,originalAssetId:true}});
   rows.forEach(a=>previous.set(a.id,a.originalAssetId));
  }
  const records=entries.map(e=>{
   const originalAssetId=assets.get(e.originalKey),thumbnailAssetId=assets.get(e.thumbnailKey);
   if(!originalAssetId||!thumbnailAssetId)throw new CommerceError('Referências da importação incompletas.',503);
   return {id:e.id,name:e.name,category:e.category,subcategory:e.subcategory,tags:[],compatibleTypes:[],originalAssetId,thumbnailAssetId,origin:'R2: '+e.object.key,usageRights:'Pendente de confirmação dos direitos comerciais.',active:false};
  });
  const newRecords=records.filter(a=>!previous.has(a.id));
  for(let i=0;i<newRecords.length;i+=batchSize)await tx.artwork.createMany({data:newRecords.slice(i,i+batchSize),skipDuplicates:true});
  for(const art of records){
   if(previous.has(art.id)&&previous.get(art.id)!==art.originalAssetId)await tx.artwork.update({where:{id:art.id},data:{originalAssetId:art.originalAssetId,thumbnailAssetId:art.thumbnailAssetId,active:false,revision:{increment:1}}});
  }
  await tx.artwork.updateMany({where:{id:{startsWith:'r2lib_',notIn:ids},active:true},data:{active:false,revision:{increment:1}}});
  report.artworkIds=ids;
  await tx.auditLog.create({data:{actorId,action:'R2_ART_SYNC',entity:'Artwork',entityId:'r2-library',detail:JSON.parse(JSON.stringify(report))}});
  return report;
 },{timeout:120000,maxWait:5000});
}
function referenceKey(storageKey:string){try{return JSON.parse(Buffer.from(storageKey.slice('r2art:'.length),'base64url').toString()).key as string;}catch{throw new CommerceError('Referência de arte inválida.');}}
export async function configureLibrary(actorId:string,raw:unknown){
 const mapping=parseMapping(raw);
 for(const m of mapping)if(m.active&&(!m.types.length||!m.authorized||!m.origin||!m.license))throw new CommerceError('Para ativar uma categoria, informe os produtos, a origem, a licença e confirme a autorização comercial.');
 return db.$transaction(async tx=>{
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(70943216)`;
  const latest=await tx.auditLog.findFirst({where:{action:'R2_ART_SYNC'},orderBy:{createdAt:'desc'},select:{detail:true}});
  const available=new Set((latest?.detail as LibraryReport|null)?.artworkIds??[]);
  const rows=await tx.artwork.findMany({where:{id:{startsWith:'r2lib_'}},select:{id:true,originalAsset:{select:{storageKey:true}}}});
  let published=0;
  for(const art of rows){
   const key=referenceKey(art.originalAsset.storageKey),m=[...mapping].sort((a,b)=>b.prefix.length-a.prefix.length).find(m=>key.startsWith(m.prefix));
   const active=available.has(art.id)&&!!m?.active&&!!m.authorized&&!!m.types.length&&!!m.origin&&!!m.license;
   // Explicit category configuration applies to its images; later individual edits are preserved by sync.
   await tx.artwork.update({where:{id:art.id},data:{active,compatibleTypes:m?.types??[],...(m?.origin?{origin:m.origin}:{}),...(m?.authorized&&m.license?{usageRights:m.license}:{usageRights:'Pendente de confirmação dos direitos comerciais.'}),revision:{increment:1}}});
   if(active)published++;
  }
  await tx.auditLog.create({data:{actorId,action:'R2_ART_CONFIG',entity:'Artwork',entityId:'r2-library',detail:JSON.parse(JSON.stringify({mapping,published}))}});
  return {published,mapping};
 },{timeout:120000});
}
export async function libraryAuthorizations(rows:{id:string;originalAsset:{storageKey:string}}[]){
 const [config,edits]=await Promise.all([db.auditLog.findFirst({where:{action:'R2_ART_CONFIG'},orderBy:{createdAt:'desc'},select:{detail:true,createdAt:true}}),db.auditLog.findMany({where:{action:'R2_ART_INDIVIDUAL',entityId:{in:rows.map(r=>r.id)}},orderBy:{createdAt:'desc'},select:{entityId:true,detail:true,createdAt:true},take:1000})]);
 const mapping=(config?.detail as {mapping?:FolderMapping[]}|null)?.mapping??[];
 return new Map(rows.map(row=>{
  const edit=edits.find(e=>e.entityId===row.id);
  if(edit&&(!config||edit.createdAt>config.createdAt))return [row.id,(edit.detail as {commercialAuthorized?:boolean}).commercialAuthorized===true];
  const key=referenceKey(row.originalAsset.storageKey),m=[...mapping].sort((a,b)=>b.prefix.length-a.prefix.length).find(m=>key.startsWith(m.prefix));
  return [row.id,!!m?.authorized&&!!m.origin&&!!m.license];
 }));
}
