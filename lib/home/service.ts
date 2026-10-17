import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { CommerceError } from "@/lib/commerce/errors";
import { initialBanners, parseBanners, type Banner } from "./banners";

export async function homeBanners() {
 try {
  const ready=await db.$queryRaw<{name:string|null}[]>`SELECT to_regclass('public."HomeContent"')::text AS name`;
  if(!ready[0]?.name){console.warn('HOME_BANNERS_FALLBACK',{operation:'read_home_banners',code:'HOME_CONTENT_MISSING'});return fallback(true);}
  const rows=await db.$queryRaw<{banners:unknown;revision:number}[]>`SELECT banners,revision FROM public."HomeContent" WHERE id='home'`;
  if(!rows.length)console.warn('HOME_BANNERS_FALLBACK',{operation:'read_home_banners',code:'HOME_CONTENT_UNSAVED'});
  return {banners:rows.length?parseBanners(rows[0].banners):initialBanners(),revision:rows[0]?.revision??0,provisioningRequired:false,readOnly:false,persistenceMessage:''};
 }catch(error){
  const e=error as {code?:string;errorCode?:string;meta?:{code?:string}};
  const raw=e?.code??e?.errorCode;
  const missing=raw==='P2021'||(raw==='P2010'&&e?.meta?.code==='42P01');
  console.error('HOME_BANNERS_FALLBACK',{operation:'read_home_banners',code:missing?'HOME_CONTENT_MISSING':/^P\d{4}$/.test(raw??'')?raw:'HOME_BANNERS_READ_FAILED'});
  return fallback(missing);
 }
}
function fallback(missing:boolean){return {banners:initialBanners(),revision:0,provisioningRequired:missing,readOnly:true,persistenceMessage:missing?'Migration HomeContent pendente. Banners padrão somente para leitura; salvar e enviar imagens estão bloqueados.':'Banco indisponível. Banners padrão somente para leitura; salvar e enviar imagens estão bloqueados. Confira a conexão deste ambiente.'};}
async function validTargets(banners:Banner[],tx:Prisma.TransactionClient) {
  for(const b of banners){
    if(b.image.startsWith('/api/arquivos/')){
      const asset=await tx.storedAsset.findFirst({where:{id:b.image.slice('/api/arquivos/'.length),public:true,mime:{in:['image/png','image/jpeg','image/webp']}},select:{id:true}});
      if(!asset)throw new CommerceError(`Imagem indisponível: ${b.name}.`);
    }
    if(!b.active||b.destination==='WHATSAPP'||b.destination==='EXTERNAL')continue;
    if(b.destination==='PRODUCT'||b.target.startsWith('/produtos/')){
      if(!/^\/produtos\/[a-z0-9-]+$/.test(b.target)||!await tx.product.findFirst({where:{slug:b.target.slice(10),status:'ACTIVE',deletedAt:null,category:{active:true}},select:{id:true}}))throw new CommerceError(`Selecione um produto publicado: ${b.name}.`);
    }else if(b.destination==='CATEGORY'||b.target.startsWith('/colecoes/')){
      const parts=b.target.split('/').slice(2);
      if(!/^\/colecoes\/[a-z0-9-]+(?:\/[a-z0-9-]+)?$/.test(b.target)||!await tx.category.findFirst({where:{slug:parts.at(-1),active:true,...(parts.length===1?{parentId:null}:{parent:{slug:parts[0],active:true,parentId:null}})},select:{id:true}}))throw new CommerceError(`Selecione uma categoria ativa: ${b.name}.`);
    }else if(!['/','/catalogo','/#uniformes','/#personalize','/#orcamento','/login'].includes(b.target))throw new CommerceError(`Página interna inválida: ${b.name}.`);
  }
}
export async function saveHomeBanners(value:unknown,revision:unknown,actorId:string){
  let banners:Banner[];try{banners=parseBanners(value);}catch(e){throw new CommerceError((e as Error).message);}
  if(!Number.isSafeInteger(revision)||Number(revision)<0)throw new CommerceError('Versão inválida.');
  return db.$transaction(async tx=>{
    await validTargets(banners,tx);
    const changed=await tx.$queryRaw<{revision:number}[]>`INSERT INTO public."HomeContent" (id,banners,revision,"updatedAt") VALUES ('home',${JSON.stringify(banners)}::jsonb,1,CURRENT_TIMESTAMP) ON CONFLICT (id) DO UPDATE SET banners=EXCLUDED.banners,revision="HomeContent".revision+1,"updatedAt"=CURRENT_TIMESTAMP WHERE "HomeContent".revision=${Number(revision)} RETURNING revision`;
    if(Number(revision)!==0&&changed[0]?.revision===1)throw new CommerceError('Configuração removida por outra sessão. Recarregue.',409);
    if(!changed.length)throw new CommerceError('Outra sessão alterou os banners. Recarregue antes de salvar.',409);
    await tx.auditLog.create({data:{actorId,action:'HOME_BANNERS_SAVE',entity:'HomeContent',entityId:'home',detail:{count:banners.length,revision:changed[0].revision}}});
    return {banners,revision:changed[0].revision,provisioningRequired:false};
  },{isolationLevel:'Serializable'});
}
