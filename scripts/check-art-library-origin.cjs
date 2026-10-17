'use strict';
// Offline regression: proxy-origin authorization and API diagnostics; no credentials or connections.
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript'),assert=require('node:assert/strict');
function load(file,imports,env={}){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{module:m,exports:m.exports,require:id=>{if(id in imports)return imports[id];throw Error('Unexpected import '+id);},process:{env},URL,TextDecoder,Request,Response,console:{error:()=>{}}});return m.exports;}
class CommerceError extends Error{constructor(message,status=400){super(message);this.status=status;}}
const sameOrigin=request=>{if(request.headers.get('origin')!==new URL(request.url).origin)throw new CommerceError('Origem não autorizada.',403);};
const env={MA_HOSTED_PRODUCTION:'1',MA_RUNTIME:'production',NODE_ENV:'production',NEXT_PUBLIC_SITE_URL:'https://maconfeccoes.com.br'};
const {assertArtLibraryOrigin}=load('lib/commerce/art-library-origin.ts',{'./auth':{CommerceError,sameOrigin}},env);
const request=origin=>new Request('http://internal-host:3000/api/art-library',{method:'POST',headers:{...(origin?{origin}:{}),'x-forwarded-host':'maconfeccoes.com.br','content-type':'application/json'},body:JSON.stringify({action:'sync',mapping:[]})});
assert.doesNotThrow(()=>assertArtLibraryOrigin(request('https://maconfeccoes.com.br')));
for(const origin of ['https://evil.example','http://maconfeccoes.com.br',null])assert.throws(()=>assertArtLibraryOrigin(request(origin)),e=>e.status===403);
const local=load('lib/commerce/art-library-origin.ts',{'./auth':{CommerceError,sameOrigin}},{});
assert.doesNotThrow(()=>local.assertArtLibraryOrigin(new Request('http://localhost:3003/api/art-library',{headers:{origin:'http://localhost:3003'}})));
assert.throws(()=>local.assertArtLibraryOrigin(request('https://maconfeccoes.com.br')));
const missing=load('lib/commerce/art-library-origin.ts',{'./auth':{CommerceError,sameOrigin}},{...env,NEXT_PUBLIC_SITE_URL:''});assert.throws(()=>missing.assertArtLibraryOrigin(request(env.NEXT_PUBLIC_SITE_URL)),e=>e.status===503);
let permission=true,calls=0,dbError=null;
const api=load('app/api/art-library/route.ts',{
 'next/server':{NextResponse:{json:(value,init)=>Response.json(value,init)}},'@/lib/db':{db:{}},
 '@/lib/commerce/auth':{CommerceError,requireUser:async()=>({id:'admin'}),requirePermission:async()=>{if(!permission)throw new CommerceError('Faça login.',401);return {id:'admin'};}},
 '@/lib/commerce/art-library-origin':{assertArtLibraryOrigin},'@/lib/commerce/artwork':{artworkPublicSelect:{}},
 '@/lib/commerce/r2-library':{syncLibrary:async()=>{calls++;if(dbError)throw dbError;return {indexed:471};}},
 '@/lib/commerce/storage':{boundedBody:async request=>new Uint8Array(await request.arrayBuffer())},
});
(async()=>{
 assert.equal((await api.POST(request('https://evil.example'))).status,403);assert.equal(calls,0);
 permission=false;assert.equal((await api.POST(request(env.NEXT_PUBLIC_SITE_URL))).status,401);assert.equal(calls,0);
 permission=true;assert.equal((await api.POST(request(env.NEXT_PUBLIC_SITE_URL))).status,200);assert.equal(calls,1);
 for(const code of ['P1001','P1011','P2021','P2022','P2028']){dbError={code,message:'SECRET_NOT_TO_RETURN'};const r=await api.POST(request(env.NEXT_PUBLIC_SITE_URL)),v=await r.json();assert.equal(r.status,503);assert.equal(v.code,code);assert.ok(!JSON.stringify(v).includes('SECRET_NOT_TO_RETURN'));}
 console.log('Library origin: Hostinger proxy accepted only for configured HTTPS origin; foreign/missing origins blocked; local checks, authentication and safe Prisma diagnostics preserved: OK (offline).');
})().catch(e=>{console.error(e);process.exitCode=1;});
