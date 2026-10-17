'use strict';
// Targeted offline checks. No environment files, database, browser or storage calls.
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),assert=require('node:assert/strict');
function load(file,imports){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{module:m,exports:m.exports,require:id=>{if(id in imports)return imports[id];throw Error('Unexpected import '+id);},URL,console,TextDecoder});return m.exports;}
const banners=load('lib/home/banners.ts',{'@/app/collections':{whatsapp:'https://wa.me/5511947944345'}});
const defaults=banners.initialBanners();assert.equal(defaults.length,5);assert.equal(banners.parseBanners(defaults).length,5);
assert.equal(new URL(banners.bannerHref(defaults[0])).searchParams.get('text'),defaults[0].message);
assert.deepEqual(Array.from(defaults,b=>b.image),['/herohome-ma.png','/hero_almofadas.png','/hero-camiseta.png','/hero-caneca.png','/hero-azulejo.png']);
const ten=Array.from({length:10},(_,i)=>({...defaults[1],id:'banner-'+i}));assert.equal(banners.parseBanners(ten).length,10);
assert.throws(()=>banners.parseBanners([...ten,{...defaults[1],id:'eleven'}]));
for(const patch of [{image:''},{target:''},{color1:'red'},{image:'javascript:alert(1)'},{target:'//evil.example'},{destination:'EXTERNAL',target:'http://example.com'},{destination:'EXTERNAL',target:'https://127.0.0.1'},{destination:'EXTERNAL',target:'https://user:pass@example.com'}])assert.throws(()=>banners.parseBanners([{...defaults[1],...patch}]));
assert.throws(()=>banners.parseBanners([defaults[0],defaults[0]]));
assert.equal(banners.parseBanners([{...defaults[0],active:false,image:'',title1:'',button:''}])[0].active,false);
class CommerceError extends Error{constructor(message,status=400){super(message);this.status=status;}}
let provisioned=true,record=null,audits=0,validCategory=true,validProduct=true,validAsset=true,dbFailure=null;
const tx={
 storedAsset:{findFirst:async()=>validAsset?{id:'image'}:null},
 category:{findFirst:async()=>validCategory?{id:'category'}:null},
 product:{findFirst:async()=>validProduct?{id:'product'}:null},
 auditLog:{create:async()=>{audits++;}},
 $queryRaw:async(strings,...values)=>{const sql=strings.join('?');if(sql.startsWith('INSERT')){const [json,revision]=values;if(record&&record.revision!==revision)return [];record={banners:JSON.parse(json),revision:(record?.revision??0)+1};return [{revision:record.revision}];}throw Error('Unexpected SQL');},
};
const db={...tx,$queryRaw:async strings=>{if(dbFailure)throw dbFailure;return strings.join('').includes('to_regclass')?[{name:provisioned?'public.HomeContent':null}]:record?[record]:[];},$transaction:async fn=>{const before=record&&JSON.parse(JSON.stringify(record));try{return await fn(tx);}catch(e){record=before;throw e;}}};
const service=load('lib/home/service.ts',{'@/lib/db':{db},'@/prisma/client':{},'@prisma/client':{},'@/lib/commerce/errors':{CommerceError},'./banners':banners});
(async()=>{
 provisioned=false;assert.equal((await service.homeBanners()).provisioningRequired,true);
 for(const code of ['P1000','P1001','P1011','P2021']){dbFailure={errorCode:code,message:'SECRET_NOT_TO_LOG'};const fallback=await service.homeBanners();assert.equal(fallback.banners.length,5);assert.equal(fallback.readOnly,true);assert.equal(fallback.provisioningRequired,code==='P2021');}
 dbFailure={code:'P2010',meta:{code:'42P01'}};assert.equal((await service.homeBanners()).provisioningRequired,true);dbFailure=null;
 provisioned=true;assert.equal((await service.homeBanners()).banners.length,5);
 const edited=defaults.map((b,i)=>({...b,title1:i?'Manual title':b.title1,color2:'#B89154'}));edited[2].active=false;
 let saved=await service.saveHomeBanners(edited,0,'admin');assert.equal(saved.revision,1);assert.equal(audits,1);assert.equal((await service.homeBanners()).banners[1].title1,'Manual title');assert.equal((await service.homeBanners()).banners.filter(b=>b.active).length,4);
 await assert.rejects(()=>service.saveHomeBanners(edited,0,'admin'),e=>e.status===409);
 const reversed=[...edited].reverse();saved=await service.saveHomeBanners(reversed,1,'admin');assert.equal(saved.banners[0].id,defaults[4].id);assert.equal(saved.banners[0].order,0);
 await service.saveHomeBanners(ten,2,'admin');assert.equal((await service.homeBanners()).banners.length,10);
 validCategory=false;await assert.rejects(()=>service.saveHomeBanners([{...defaults[1],destination:'CATEGORY',target:'/colecoes/inexistente'}],3,'admin'));
 validProduct=false;await assert.rejects(()=>service.saveHomeBanners([{...defaults[1],destination:'PRODUCT',target:'/produtos/inexistente'}],3,'admin'));
 validAsset=false;await assert.rejects(()=>service.saveHomeBanners([{...defaults[1],image:'/api/arquivos/private'}],3,'admin'));
 assert.equal((await service.homeBanners()).revision,3);
 let authorized=false;
 const api=load('app/api/home-banners/route.ts',{
  'next/server':{NextResponse:{json:(data,init)=>Response.json(data,init)}},
  '@/lib/db':{db:{category:{findMany:async()=>[]},product:{findMany:async()=>[]}}},
  '@/lib/commerce/auth':{CommerceError,requirePermission:async permission=>{assert.equal(permission,'settings');if(!authorized)throw new CommerceError('Forbidden',403);return {id:'admin'};},sameOrigin:request=>{if(request.headers.get('origin')!==new URL(request.url).origin)throw new CommerceError('Origin invalid',403);}},
  '@/lib/commerce/storage':{boundedBody:async request=>new Uint8Array(await request.arrayBuffer())},
  '@/lib/home/service':service,
 });
 assert.equal((await api.GET()).status,403);authorized=true;
 const get=await api.GET();assert.equal(get.status,200);assert.equal((await get.json()).banners.length,10);
 const cross=new Request('https://homologacao.example/api/home-banners',{method:'POST',headers:{origin:'https://other.example'},body:'{}'});assert.equal((await api.POST(cross)).status,403);
 provisioned=false;const pending=new Request('https://homologacao.example/api/home-banners',{method:'POST',headers:{origin:'https://homologacao.example'},body:JSON.stringify({banners:ten,revision:3})});assert.equal((await api.POST(pending)).status,503);provisioned=true;
 dbFailure={errorCode:'P1001'};const offlineGet=await api.GET();assert.equal(offlineGet.status,200);assert.equal((await offlineGet.json()).readOnly,true);
 const offlinePost=new Request('https://homologacao.example/api/home-banners',{method:'POST',headers:{origin:'https://homologacao.example'},body:JSON.stringify({banners:ten,revision:3})});assert.equal((await api.POST(offlinePost)).status,503);dbFailure=null;assert.equal((await service.homeBanners()).banners.length,10);assert.equal((await service.homeBanners()).readOnly,false);
 for(const file of ['app/premium.module.css','components/commerce/BannersWorkspace.module.css'])require('postcss').parse(fs.readFileSync(file,'utf8'));
 console.log('Home banners: defaults, 10 limit, safe URLs/colors, WhatsApp, active flags, target/asset validation, versioned save/reopen, reorder, conflict rejection, API permissions/origin, pending migration and CSS: OK (offline fixtures; no browser/upload).');
})().catch(e=>{console.error(e);process.exitCode=1;});
