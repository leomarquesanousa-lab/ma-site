// Offline studio contract checks. Database, R2 and HTTP are replaced with in-memory fixtures.
const fs=require('node:fs'),ts=require('typescript'),assert=require('node:assert/strict'),Module=require('node:module');
const old=require.extensions['.ts'];
require.extensions['.ts']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,file);
const v=require('../lib/commerce/validation.ts'),p=require('../lib/commerce/production.ts'),{CommerceError}=require('../lib/commerce/errors.ts');
const area={id:'front-area',name:'Front',x:.1,y:.1,width:.8,height:.8,printWidthMm:200,printHeightMm:200,allowText:true,allowImage:true};
const image={id:'one',templateId:'front',areaId:area.id,type:'image',value:'/api/arquivos/owned',x:.5,y:.5,width:.4,height:.4,rotation:0,color:'#211b1d',pixelWidth:1200,pixelHeight:1200};
assert.equal(p.effectiveDpi(image,area),304);
assert.equal(p.effectiveDpi({...image,pixelWidth:300,pixelHeight:300},area),76);
assert.equal(p.effectiveDpi(image,{...area,printWidthMm:null}),null);
assert.throws(()=>v.composition([image,image],[area]));
assert.throws(()=>v.composition([{...image,fontFamily:'url(evil)'}],[area]));
assert.throws(()=>v.composition([{...image,x:.9,rotation:45}],[area]));
const manifest=p.productionManifest([image],[area]);assert.equal(manifest.schemaVersion,2);assert.equal(manifest.elements[0].physical.width,100);assert.equal(manifest.exportStatus,'PENDING_INDUSTRIAL_VALIDATION');
const views=[{id:'front',productType:'SHIRT',variantIds:[],areas:[area],maxFileBytes:5242880},{id:'back',productType:'SHIRT',variantIds:[],areas:[{...area,id:'back-area'}],maxFileBytes:5242880}];
let persisted;
const db={product:{findFirst:async()=>({id:'shirt'})},customizationTemplate:{findFirst:async()=>views[0],findMany:async()=>views},productVariant:{findFirst:async()=>({id:'variant'})},storedAsset:{findFirst:async({where})=>(where.id==='owned'&&where.ownerId==='customer'||where.id==='licensed-original'&&!where.ownerId)?{id:'owned',pixelWidth:1200,pixelHeight:1200}:null},customerDesign:{create:async({data})=>(persisted=data,{id:'saved',...data})},artwork:{findFirst:async({where})=>where.id==='licensed'&&where.compatibleTypes.has==='SHIRT'?{id:'licensed',revision:1,origin:'MA',usageRights:'Own work',originalAssetId:'licensed-original',thumbnailAssetId:'thumb',preset:[{text:'MA',locked:true}]}:null}};
const originalRequire=Module.prototype.require;
Module.prototype.require=function(id){const mocks={
 'next/server':{NextResponse:{json:(data,init)=>Response.json(data,init)}},
 '@/lib/db':{db},'@/lib/commerce/auth':{CommerceError,requireUser:async()=>({id:'customer'}),sameOrigin:()=>{}},
 '@/lib/commerce/artwork':{},'@/lib/commerce/service':{},'@/lib/commerce/admin':{},
 '@/lib/commerce/storage':{boundedBody:async request=>Buffer.from(await request.text())},
 '@/lib/commerce/validation':v,'@/lib/commerce/production':p
 };return id in mocks?mocks[id]:originalRequire.call(this,id);};
const route=require('../app/api/commerce/[...path]/route.ts');
Module.prototype.require=originalRequire;
async function save(elements){return route.POST(new Request('http://local/api/commerce/designs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({productId:'shirt',variantId:'variant',templateId:'front',composition:elements})}),{params:Promise.resolve({path:['designs']})});}
(async()=>{
 const back={...image,id:'two',templateId:'back',areaId:'back-area'};
 assert.equal((await save([{...image,pixelWidth:999999},back])).status,200);
 assert.equal(persisted.composition[0].pixelWidth,1200);assert.equal(persisted.composition[0].sourceAssetId,'owned');assert.equal(persisted.templateSnapshot.views.length,2);
 assert.equal((await save([{...image,templateId:'back'}])).status,400);
 assert.equal((await save([{...image,value:'/api/arquivos/another-owner'}])).status,400);
 assert.equal((await save([{...image,artworkId:'inactive'}])).status,400);
 assert.equal((await save([{...image,x:1}])).status,400);
 const licensed={...image,artworkId:'licensed',value:'/api/arquivos/thumb'};
 const locked={...image,...p.presetLayout(area,0,1,'MA'),id:'locked',type:'text',artworkId:'licensed',presetIndex:0};
 assert.equal((await save([licensed])).status,400);
 assert.equal((await save([licensed,locked])).status,200);
 assert.equal(persisted.composition[0].sourceAssetId,'licensed-original');assert.equal(persisted.composition[1].locked,true);
 assert.equal((await save([licensed,{...locked,value:'tampered'}])).status,400);
 assert.equal((await save([licensed,{...locked,x:.55}])).status,400);
 const serviceModule=new Module(require.resolve('../lib/commerce/service.ts'),module);
 serviceModule.filename=require.resolve('../lib/commerce/service.ts');
 serviceModule.require=id=>id==='@/lib/db'?{db}:id==='./auth'?{CommerceError}:id==='./validation'?v:require(id);
 serviceModule._compile(ts.transpileModule(fs.readFileSync(serviceModule.filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,serviceModule.filename);
 let productionNote;
 db.$transaction=async fn=>fn({order:{findUnique:async()=>({status:'CONFIRMED',items:[{snapshot:{design:{id:'saved'}}}]}),update:async({data})=>{productionNote=data.history.create.note;}},auditLog:{create:async()=>{}}});
 await assert.rejects(()=>serviceModule.exports.changeOrder('admin','order','PRODUCTION','review'));
 await serviceModule.exports.changeOrder('admin','order','PRODUCTION','review',true);
 assert.equal(productionNote,'[ARTE CONFERIDA] review');
 require.extensions['.ts']=old;
 console.log('Studio offline checks passed: geometry, fonts, DPI/mm, multi-view snapshot, original authorization, metadata spoofing, unavailable artwork, locked template layers and mandatory production review.');
})().catch(e=>{console.error(e);process.exitCode=1;});
