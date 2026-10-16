'use strict';
const path=require('node:path');
const {installNextEnv}=require('./next-env.cjs');
const {assertLocalDatabaseUrl}=require('./local-db-target.cjs');
const {spawnSync}=require('node:child_process');
function main(){
 const [command,...args]=process.argv.slice(2);
 if(!['dev','start','build'].includes(command))throw new Error('Comando Next não permitido.');
 const values=installNextEnv();
 // Even start/build can execute server-side code locally. Never allow production
 // Neon writes through these convenience commands on a development workstation.
 if(values.MA_HOSTED_PRODUCTION==='1'){
  if(command==='dev')throw Error('Desenvolvimento não permitido no ambiente hospedado.');
  if(command==='build'){
   if(args.some(arg=>arg==='--turbo'||arg==='--turbopack'))throw Error('Build hospedado exige Webpack.');
   if(!args.includes('--webpack'))args.push('--webpack');
   const result=spawnSync(process.execPath,[require.resolve('prisma/build/index.js'),'generate'],{cwd:process.cwd(),env:process.env,stdio:'pipe',encoding:'utf8',timeout:120000,windowsHide:true});
   if(result.error||result.status!==0)throw Error('Falha ao gerar Prisma Client; build interrompido.');
   console.log('Prisma Client gerado para o ambiente hospedado.');
  }
 }
 else if(command!=='start'||values.MA_RUNTIME!=='production')assertLocalDatabaseUrl(values.DATABASE_URL);
 else process.env.NODE_ENV='production';
 const cli=path.resolve(__dirname,'../node_modules/next/dist/bin/next');
 process.argv=[process.execPath,cli,command,...args];
 require(cli);
}
try{main();}catch{console.error(process.env.MA_HOSTED_PRODUCTION==='1'?'Execução hospedada interrompida. Confira configuração de produção e geração do Prisma Client.':'Execução local bloqueada: .env deve conter um PostgreSQL de desenvolvimento isolado. Não use a conexão Neon de produção para executar o site local.');process.exitCode=1;}
