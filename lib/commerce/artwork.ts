import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { CommerceError } from './errors';
import { choice, flag, integer, list, object, text } from './validation';
import type { FolderMapping, LibraryReport } from './r2-library';
export const artworkPublicSelect = { id:true, name:true, category:true, subcategory:true, tags:true, compatibleTypes:true, thumbnailAssetId:true, preset:true, revision:true } satisfies Prisma.ArtworkSelect;
export async function saveArtwork(actorId:string, raw:unknown) {
 const b=object(raw), id=text(b.id,'ID',100,true);
 const imported=id.startsWith('r2lib_');
 const data={name:text(b.name,'Nome',180),category:text(b.category,'Tema',100),subcategory:text(b.subcategory,'Subtema',100,true),tags:list(b.tags??[],'Tags',30).filter(v=>typeof v==='string'&&v.trim()).map(v=>text(v,'Tag',60)),compatibleTypes:list(b.compatibleTypes,'Compatibilidade',imported?4:2).map(v=>choice(v,imported?['MUG','SHIRT','PILLOW','TILE']:['MUG','SHIRT'],'Produto')),originalAssetId:text(b.originalAssetId,'Original',100),thumbnailAssetId:text(b.thumbnailAssetId,'Miniatura',100),origin:text(b.origin,'Origem',500),usageRights:text(b.usageRights,'Direitos de uso',2000),active:flag(b.active??false)};
 if(imported&&data.active&&(b.commercialAuthorized!==true||data.usageRights==='Pendente de confirmação dos direitos comerciais.'))throw new CommerceError('Informe a licença e confirme os direitos comerciais antes de publicar esta arte.');
 if(!data.compatibleTypes.length&&(!imported||data.active))throw new CommerceError('Escolha os produtos compatíveis.');
 // Locked preset layers use canonical geometry validated again when the project is saved.
 const preset=b.preset==null?[]:list(b.preset,'Elementos do modelo',10).map(raw=>{const p=object(raw);return {text:text(p.text,'Texto',200),locked:flag(p.locked??false)};});
 return db.$transaction(async tx=>{
  const original=await tx.storedAsset.findFirst({where:{id:data.originalAssetId,public:false}});
  const thumbnail=await tx.storedAsset.findFirst({where:{id:data.thumbnailAssetId,public:true}});
  if(!original||!thumbnail)throw new CommerceError('Envie um original privado e sua miniatura.');
  if(id){const previous=await tx.artwork.findUnique({where:{id}});if(!previous||previous.revision!==integer(b.revision,'Revisão',1))throw new CommerceError('Arte alterada. Recarregue.',409);
   if(imported){
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(70943216)`;
    if(previous.originalAssetId!==data.originalAssetId||previous.thumbnailAssetId!==data.thumbnailAssetId)throw new CommerceError('O original importado é preservado. Atualize os arquivos pela sincronização.');
    if(data.active){
     const sync=await tx.auditLog.findFirst({where:{action:'R2_ART_SYNC'},orderBy:{createdAt:'desc'},select:{detail:true}});
     if(!(sync?.detail as LibraryReport|null)?.artworkIds?.includes(id))throw new CommerceError('Arte não encontrada na última sincronização.');
     const config=await tx.auditLog.findFirst({where:{action:'R2_ART_CONFIG'},orderBy:{createdAt:'desc'},select:{detail:true}});
     const key=JSON.parse(Buffer.from(original.storageKey.slice('r2art:'.length),'base64url').toString()).key as string;
     const mapping=(config?.detail as {mapping?:FolderMapping[]}|null)?.mapping??[];
     const folder=[...mapping].sort((a,b)=>b.prefix.length-a.prefix.length).find(m=>key.startsWith(m.prefix));
     if(folder&&!folder.active)throw new CommerceError('Ative a categoria antes de publicar esta imagem.');
    }
   }
  }
  const art=id?await tx.artwork.update({where:{id,revision:integer(b.revision,'Revisao',1)},data:{...data,preset,revision:{increment:1}}}):await tx.artwork.create({data:{...data,preset}});
  await tx.auditLog.create({data:{actorId,entity:'Artwork',entityId:art.id,action:imported?'R2_ART_INDIVIDUAL':id?'UPDATE':'CREATE',detail:{name:art.name,revision:art.revision,...(imported?{commercialAuthorized:b.commercialAuthorized===true}:{})}}});return art;
 });
}
