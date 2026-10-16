'use strict';
const path=require('node:path'),fs=require('node:fs');
function assertHostedProduction(values,platform=process.platform){
 const fail=code=>{const error=Error('Hosted configuration rejected.');error.safeCode=code;throw error;};
 if(platform!=='linux')fail('HOSTED_PLATFORM_INVALID');
 if(values.MA_HOSTED_PRODUCTION!=='1')fail('HOSTED_FLAG_INVALID');
 if(values.MA_RUNTIME!=='production')fail('HOSTED_MA_RUNTIME_INVALID');
 if(values.NODE_ENV!=='production')fail('HOSTED_NODE_ENV_INVALID');
 if((values.MA_HOMOLOGATION&&values.MA_HOMOLOGATION!=='0')||Object.keys(values).some(k=>(k.startsWith('HOMOLOGATION_')||k==='R2_TEST_PREFIX')&&values[k]))fail('HOSTED_HOMOLOGATION_CONFLICT');
 let url;try{url=new URL(values.DATABASE_URL);}catch{fail('HOSTED_DATABASE_URL_INVALID');}
 if(!['postgres:','postgresql:'].includes(url.protocol)||!['ep-soft-tooth-b62ei5ko-pooler.c-2.sa-east-1.aws.neon.tech','ep-soft-tooth-b62ei5ko.c-2.sa-east-1.aws.neon.tech'].includes(url.hostname)||url.pathname!=='/neondb'||!url.username||!url.password||url.hash||(url.port&&url.port!=='5432')||(url.searchParams.has('schema')&&url.searchParams.get('schema')!=='public'))fail('HOSTED_DATABASE_TARGET_INVALID');
 if(values.ASSET_STORAGE!=='r2')fail('HOSTED_ASSET_STORAGE_INVALID');
 if(values.R2_BUCKET!=='maconfeccoes')fail('HOSTED_R2_BUCKET_INVALID');
 if(!values.R2_ACCESS_KEY_ID||!values.R2_SECRET_ACCESS_KEY||!/^[a-f0-9]{32}$/.test(values.R2_ACCOUNT_ID??''))fail('HOSTED_R2_CONFIGURATION_INVALID');
 const ca=path.resolve(process.cwd(),'prisma/certs/neon-root-ca.pem');if(!fs.existsSync(ca))fail('HOSTED_CA_MISSING');
 url.searchParams.set('schema','public');url.searchParams.set('sslmode','require');url.searchParams.set('sslaccept','strict');url.searchParams.set('sslcert',ca);
 return {...values,DATABASE_URL:url.href,MA_HOMOLOGATION:'0',DIRECT_URL:'',SHADOW_DATABASE_URL:''};
}
module.exports={assertHostedProduction};
