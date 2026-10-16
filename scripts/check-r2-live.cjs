// Explicit live R2 smoke test. No database/API mutation, only one uniquely named object.
'use strict';
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),crypto=require('node:crypto'),ts=require('typescript'),sharp=require('sharp');
const metadataOnly=process.argv[2]==='--metadata-only';
if(process.argv.length!==3||(!metadataOnly&&process.argv[2]!=='--run')){console.error('Use --metadata-only for HEAD bucket; --run requires authorization for PUT/GET/DELETE.');process.exit(1);}
const root=path.resolve(__dirname,'..');
require('./project-env.cjs').loadProjectEnv();
if(process.env.R2_BUCKET!=='maconfeccoes'||process.env.ASSET_STORAGE!=='r2'||!/^[a-f0-9]{32}$/.test(process.env.R2_ACCOUNT_ID??'')||!process.env.R2_ACCESS_KEY_ID||!process.env.R2_SECRET_ACCESS_KEY)throw new Error('Unexpected R2 test configuration.');
function load(file){const m=new Module(file,module);m.filename=file;m.require=id=>id.startsWith('./')?load(path.resolve(path.dirname(file),id+'.ts')):require(id);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,file);return m.exports;}
const {r2Request}=load(path.join(root,'lib/commerce/r2.ts'));
const testId=crypto.randomUUID(),testKey='private/connection-tests/'+testId;
const hash=value=>crypto.createHash('sha256').update(value).digest('hex'),hmac=(key,value)=>crypto.createHmac('sha256',key).update(value).digest();
async function testObjectRequest(method,key){
 if(!(metadataOnly&&method==='HEAD'&&key==='')&&(!['DELETE','HEAD'].includes(method)||key!==testKey||!/^private\/connection-tests\/[0-9a-f-]{36}$/.test(key)))throw new Error('Cleanup target refused.');
 const host=process.env.R2_ACCOUNT_ID+'.r2.cloudflarestorage.com',uri='/'+process.env.R2_BUCKET+(key?'/'+key:''),date=new Date().toISOString().replace(/[:-]|\.\d{3}/g,''),day=date.slice(0,8),scope=day+'/auto/s3/aws4_request',payload=hash(''),signed='host;x-amz-content-sha256;x-amz-date';
 const canonical=method+'\n'+uri+'\n\nhost:'+host+'\nx-amz-content-sha256:'+payload+'\nx-amz-date:'+date+'\n\n'+signed+'\n'+payload,signing=hmac(hmac(hmac(hmac('AWS4'+process.env.R2_SECRET_ACCESS_KEY,day),'auto'),'s3'),'aws4_request'),signature=crypto.createHmac('sha256',signing).update('AWS4-HMAC-SHA256\n'+date+'\n'+scope+'\n'+hash(canonical)).digest('hex');
 return fetch('https://'+host+uri,{method,headers:{Authorization:'AWS4-HMAC-SHA256 Credential='+process.env.R2_ACCESS_KEY_ID+'/'+scope+', SignedHeaders='+signed+', Signature='+signature,'x-amz-date':date,'x-amz-content-sha256':payload},redirect:'error',signal:AbortSignal.timeout(20000)});
}
(async()=>{
 if(metadataOnly){const r=await testObjectRequest('HEAD','');console.log(JSON.stringify({test:'R2_BUCKET_METADATA',source:'.env',bucket:'maconfeccoes',httpStatus:r.status,authentication:r.status===200?'OK':'ERROR',metadataAccessible:r.status===200,uploadsPerformed:false,deletionsPerformed:false}));if(!r.ok)process.exitCode=1;return;}
 const bytes=await sharp({create:{width:8,height:8,channels:4,background:{r:crypto.randomInt(256),g:crypto.randomInt(256),b:crypto.randomInt(256),alpha:1}}}).png().toBuffer();
 let upload=false,read=false,removed=false,absent=false,attempted=false;
 try{attempted=true;const put=await r2Request('PUT',testKey,bytes,'image/png');upload=put.ok;const get=await r2Request('GET',testKey);read=Buffer.from(await get.arrayBuffer()).equals(bytes);if(!read)throw new Error('Test content mismatch; deletion refused.');}
 catch{process.exitCode=1;}
 finally{
  if(attempted){try{const check=await r2Request('GET',testKey),actual=Buffer.from(await check.arrayBuffer());if(!actual.equals(bytes)||hash(actual)!==hash(bytes))throw new Error('Cleanup content mismatch.');const del=await testObjectRequest('DELETE',testKey);removed=del.ok;if(removed)absent=(await testObjectRequest('HEAD',testKey)).status===404;}catch{process.exitCode=1;}}
  if(!upload||!read||!removed||!absent)process.exitCode=1;
  console.log(JSON.stringify({test:'R2_CONTROLLED_PNG',bucket:'maconfeccoes',testKey,bytes:bytes.length,upload,read,contentVerifiedBeforeDeletion:read,removed,absenceConfirmed:absent,existingObjectsTouched:false}));
 }
})().catch(()=>{console.error('R2 test failed; inspect the uniquely named test object before cleanup.');process.exitCode=1;});
