'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {parseEnv}=require('node:util');
const root=process.cwd();
const projectKey=/^(DATABASE_URL|DIRECT_URL|SHADOW_DATABASE_URL|MA_RUNTIME|ASSET_STORAGE|HOMOLOGATION_.*|R2_.*|SMTP_.*|EMAIL_.*|NEXT_PUBLIC_.*|NEON_.*)$/;
let previousKeys=new Set();
function readProjectEnv(){
 try{const file=process.env.MA_HOMOLOGATION==='1'?'.env.homologacao':'.env';const values=parseEnv(fs.readFileSync(path.join(root,file),'utf8').replace(/^\uFEFF/,''));if(file!=='.env')values.DATABASE_URL=require('./homologation-env.cjs').assertHomologation(values);return values;}
 catch{throw new Error('Não foi possível ler .env. Nenhuma configuração alternativa será carregada.');}
}
function loadProjectEnv(){
 const values=readProjectEnv();
 for(const key of Object.keys(process.env))if((projectKey.test(key)||previousKeys.has(key))&&!(key in values))delete process.env[key];
 for(const [key,value]of Object.entries(values))process.env[key]=value;
 previousKeys=new Set(Object.keys(values));
 return values;
}
module.exports={readProjectEnv,loadProjectEnv};
