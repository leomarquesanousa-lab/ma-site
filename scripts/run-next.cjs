'use strict';
const path=require('node:path');
const {installNextEnv}=require('./next-env.cjs');
const {assertLocalDatabaseUrl}=require('./local-db-target.cjs');
function main(){
 const [command,...args]=process.argv.slice(2);
 if(!['dev','start','build'].includes(command))throw new Error('Comando Next não permitido.');
 const values=installNextEnv();
 // Even start/build can execute server-side code locally. Never allow production
 // Neon writes through these convenience commands on a development workstation.
 if(command!=='start'||values.MA_RUNTIME!=='production')assertLocalDatabaseUrl(values.DATABASE_URL);
 else process.env.NODE_ENV='production';
 const cli=path.resolve(__dirname,'../node_modules/next/dist/bin/next');
 process.argv=[process.execPath,cli,command,...args];
 require(cli);
}
try{main();}catch{console.error('Execução local bloqueada: .env deve conter um PostgreSQL de desenvolvimento isolado. Não use a conexão Neon de produção para executar o site local.');process.exitCode=1;}
