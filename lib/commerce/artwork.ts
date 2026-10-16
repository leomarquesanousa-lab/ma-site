import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { CommerceError } from './errors';
import { choice, flag, integer, list, object, text } from './validation';
export const artworkPublicSelect = { id:true, name:true, category:true, subcategory:true, tags:true, compatibleTypes:true, thumbnailAssetId:true, preset:true, revision:true } satisfies Prisma.ArtworkSelect;
export async function saveArtwork(actorId:string, raw:unknown) {
 const b=object(raw), id=text(b.id,'ID',100,true);
 const data={name:text(b.name,'Nome',180),category:text(b.category,'Tema',100),subcategory:text(b.subcategory,'Subtema',100,true),tags:list(b.tags??[],'Tags',30).filter(v=>typeof v==='string'&&v.trim()).map(v=>text(v,'Tag',60)),compatibleTypes:list(b.compatibleTypes,'Compatibilidade',2).map(v=>choice(v,['MUG','SHIRT'],'Produto')),originalAssetId:text(b.originalAssetId,'Original',100),thumbnailAssetId:text(b.thumbnailAssetId,'Miniatura',100),origin:text(b.origin,'Origem',500),usageRights:text(b.usageRights,'Direitos de uso',2000),active:flag(b.active??false)};
 if(!data.compatibleTypes.length)throw new CommerceError('Escolha caneca ou camiseta.');
 // Locked preset layers use canonical geometry validated again when the project is saved.
 const preset=b.preset==null?[]:list(b.preset,'Elementos do modelo',10).map(raw=>{const p=object(raw);return {text:text(p.text,'Texto',200),locked:flag(p.locked??false)};});
 return db.$transaction(async tx=>{
  const original=await tx.storedAsset.findFirst({where:{id:data.originalAssetId,public:false}});
  const thumbnail=await tx.storedAsset.findFirst({where:{id:data.thumbnailAssetId,public:true}});
  if(!original||!thumbnail)throw new CommerceError('Envie um original privado e sua miniatura.');
  if(id){const previous=await tx.artwork.findUnique({where:{id}});if(!previous||previous.revision!==integer(b.revision,'Revisão',1))throw new CommerceError('Arte alterada. Recarregue.',409);}
  const art=id?await tx.artwork.update({where:{id,revision:integer(b.revision,'Revisao',1)},data:{...data,preset,revision:{increment:1}}}):await tx.artwork.create({data:{...data,preset}});
  await tx.auditLog.create({data:{actorId,entity:'Artwork',entityId:art.id,action:id?'UPDATE':'CREATE',detail:{name:art.name,revision:art.revision}}});return art;
 });
}
