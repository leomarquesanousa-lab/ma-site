import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission, sameOrigin, CommerceError } from "@/lib/commerce/auth";
import { boundedBody } from "@/lib/commerce/storage";
import { homeBanners, saveHomeBanners } from "@/lib/home/service";
export const runtime='nodejs';
function failure(e:unknown){const status=e instanceof CommerceError?e.status:503;if(!(e instanceof CommerceError)){const raw=(e as {code?:string;errorCode?:string})?.code??(e as {errorCode?:string})?.errorCode;console.error('HOME_BANNERS_API_ERROR',{operation:'admin_home_banners',code:/^P\d{4}$/.test(raw??'')?raw:'HOME_BANNERS_REQUEST_FAILED'});}return NextResponse.json({error:e instanceof CommerceError?e.message:'Persistência indisponível. Não foi possível validar a sessão ou acessar o banco. Salvamento bloqueado; confira a conexão deste ambiente.',readOnly:status===503},{status,headers:{'Cache-Control':'private, no-store'}});}
export async function GET(){try{
 await requirePermission('settings');
 const state=await homeBanners();
 if(state.readOnly)return NextResponse.json({...state,categories:[],products:[]},{headers:{'Cache-Control':'private, no-store'}});
 const [categories,products]=await Promise.all([db.category.findMany({where:{active:true,OR:[{parentId:null},{parent:{active:true}}]},select:{name:true,slug:true,parent:{select:{slug:true}}},orderBy:{name:'asc'},take:200}),db.product.findMany({where:{status:'ACTIVE',deletedAt:null,category:{active:true}},select:{name:true,slug:true},orderBy:{name:'asc'},take:200})]);
 return NextResponse.json({...state,categories:categories.map(c=>({label:c.name,value:`/colecoes/${c.parent?c.parent.slug+'/':''}${c.slug}`})),products:products.map(p=>({label:p.name,value:`/produtos/${p.slug}`}))},{headers:{'Cache-Control':'private, no-store'}});
}catch(e){return failure(e);}}
export async function POST(request:Request){try{
 sameOrigin(request);const user=await requirePermission('settings');
 const body=JSON.parse(new TextDecoder().decode(await boundedBody(request,65536)));
 const state=await homeBanners();if(state.readOnly)throw new CommerceError(state.persistenceMessage,503);
 return NextResponse.json(await saveHomeBanners(body.banners,body.revision,user.id),{headers:{'Cache-Control':'private, no-store'}});
}catch(e){return failure(e);}}
