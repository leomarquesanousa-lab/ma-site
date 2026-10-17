import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { CommerceError, requirePermission, requireUser } from '@/lib/commerce/auth';
import { assertArtLibraryOrigin } from '@/lib/commerce/art-library-origin';
import { artworkPublicSelect } from '@/lib/commerce/artwork';
import { libraryAuthorizations, libraryOverview, syncLibrary, configureLibrary } from '@/lib/commerce/r2-library';
import { boundedBody } from '@/lib/commerce/storage';
export const runtime='nodejs';
const json=(value:unknown,status=200)=>NextResponse.json(value,{status,headers:{'Cache-Control':'private, no-store'}});
function failure(error:unknown){
 const e=error as {code?:string;errorCode?:string;meta?:{code?:string}};
 const raw=e?.code??e?.errorCode,code=/^P\d{4}$/.test(raw??'')?raw!:error instanceof CommerceError?'LIBRARY_REQUEST_REJECTED':'LIBRARY_UNAVAILABLE';
 const messages:Record<string,string>={P1000:'Falha de autenticação no banco.',P1001:'Banco indisponível ou inacessível.',P1011:'Falha na validação TLS do banco.',P2021:'Tabela da biblioteca ausente. Confira as migrations aplicadas.',P2022:'Coluna da biblioteca ausente. Confira a compatibilidade do schema.',P2028:'A transação da biblioteca não pôde ser concluída no prazo. Tente novamente.',P2002:'Conflito de registros na sincronização. Tente novamente.'};
 const denied=code==='P2010'&&e.meta?.code==='42501';
 console.error('ART_LIBRARY_FAILED',{code,...(denied?{sqlState:'42501'}:{})});
 return json({error:error instanceof CommerceError?error.message:denied?'Permissão de banco insuficiente para sincronizar.':messages[code]??'Biblioteca indisponível. Consulte o código do erro nos logs do servidor.',code},error instanceof CommerceError?error.status:503);
}
export async function GET(request:Request){
 try{
  const url=new URL(request.url);
  if(url.searchParams.get('admin')==='1'){
   await requirePermission('products');
   if(url.searchParams.get('images')==='1'){
    const page=Number(url.searchParams.get('page')??0);if(!Number.isSafeInteger(page)||page<0||page>10000)throw new CommerceError('Página inválida.');
    const where={id:{startsWith:'r2lib_'},...(url.searchParams.get('q')?{name:{contains:url.searchParams.get('q')!.slice(0,180),mode:'insensitive' as const}}:{})};
    const [rows,total]=await Promise.all([db.artwork.findMany({where,include:{originalAsset:{select:{storageKey:true}}},orderBy:[{category:'asc'},{name:'asc'},{id:'asc'}],take:24,skip:page*24}),db.artwork.count({where})]);
    const authorizations=await libraryAuthorizations(rows);
    return json({items:rows.map(({originalAsset,...a})=>({...a,commercialAuthorized:authorizations.get(a.id)??false})),total,hasMore:(page+1)*24<total});
   }
   return json(await libraryOverview(url.searchParams.get('refresh')==='1'));
  }
  await requireUser();
  const type=url.searchParams.get('type')??'';
  if(!['MUG','SHIRT','PILLOW','TILE'].includes(type))throw new CommerceError('Selecione um tipo de produto configurado.');
  const q=(url.searchParams.get('q')??'').slice(0,180),category=(url.searchParams.get('category')??'').slice(0,100),subcategory=(url.searchParams.get('subcategory')??'').slice(0,100);
  const page=Number(url.searchParams.get('page')??'0');if(!Number.isSafeInteger(page)||page<0||page>10000)throw new CommerceError('Página inválida.');
  const maxBytes=Number(url.searchParams.get('maxBytes')??5242880);if(!Number.isSafeInteger(maxBytes)||maxBytes<1||maxBytes>20*1024*1024)throw new CommerceError('Limite de imagem inválido.');
  const where={active:true,compatibleTypes:{has:type},originalAsset:{bytes:{lte:maxBytes}},...(q?{name:{contains:q,mode:'insensitive' as const}}:{}),...(category?{category}:{}),...(subcategory?{subcategory}:{})};
  const [items,total,groups]=await Promise.all([db.artwork.findMany({where,select:artworkPublicSelect,orderBy:[{name:'asc'},{id:'asc'}],skip:page*24,take:24}),db.artwork.count({where}),db.artwork.groupBy({by:['category','subcategory'],where:{active:true,compatibleTypes:{has:type},originalAsset:{bytes:{lte:maxBytes}}},_count:{_all:true},orderBy:[{category:'asc'},{subcategory:'asc'}]})]);
  return json({items,total,groups,page,hasMore:(page+1)*24<total});
 }catch(e){return failure(e);}
}
export async function POST(request:Request){try{assertArtLibraryOrigin(request);const actor=await requirePermission('products');const body=JSON.parse(new TextDecoder().decode(await boundedBody(request,65536)));if(body.action==='configure')return json(await configureLibrary(actor.id,body.mapping));if(body.action!=='sync')throw new CommerceError('Ação inválida.');return json(await syncLibrary(actor.id,body.mapping??[]));}catch(e){return failure(e);}}
