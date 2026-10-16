'use strict';
const path=require('node:path');
const productionHost='ep-soft-tooth-b62ei5ko.c-2.sa-east-1.aws.neon.tech';
function assertHomologation(values){
 const fail=()=>{throw Error('Homologação bloqueada: configure endpoint isolado aprovado e namespace R2 exclusivo.');};
 if ('MA_HOMOLOGATION' in values || 'NODE_ENV' in values || 'NODE_OPTIONS' in values) fail();
 let u;try{u=new URL(values.DATABASE_URL);}catch{fail();}
 const host=u.hostname.replace('-pooler.','.');
 if(values.MA_RUNTIME!=='homologation'||!['postgres:','postgresql:'].includes(u.protocol)||!u.username||!u.password||u.pathname!=='/neondb'||u.hash||(u.port&&u.port!=='5432')||!/^ep-[a-z0-9-]+\.[a-z0-9.-]+\.neon\.tech$/.test(u.hostname)||u.hostname!==values.HOMOLOGATION_NEON_HOST||host===productionHost||require('node:crypto').createHash('sha256').update(host).digest('hex').slice(0,12)==='1628ae89a130'||(u.searchParams.has('schema')&&u.searchParams.get('schema')!=='public'))fail();
 if(values.ASSET_STORAGE!=='r2'||values.R2_BUCKET!=='maconfeccoes'||!/^homologacao\/[a-z0-9-]{8,48}$/.test(values.R2_TEST_PREFIX??''))fail();
 if(Object.keys(values).some(k=>/^(SMTP_|EMAIL_)/.test(k)&&values[k]))throw Error('Homologação sem envio de e-mail: remova configurações SMTP/EMAIL desse arquivo.');
 u.searchParams.set('schema','public');u.searchParams.set('sslmode','require');u.searchParams.set('sslaccept','strict');u.searchParams.set('sslcert',path.resolve(process.cwd(),'prisma/certs/neon-root-ca.pem'));
 return u.href;
}
module.exports={assertHomologation};
