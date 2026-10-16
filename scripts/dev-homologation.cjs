'use strict';
// No database writes, uploads, seed or migrations at startup.
if(process.argv.length>3||(process.argv[2]&&process.argv[2]!=='--check')){console.error('Use --check ou nenhum argumento.');process.exitCode=1;}
else try{
 process.env.MA_HOMOLOGATION='1';
 process.env.NODE_OPTIONS='--require '+JSON.stringify(require.resolve('./homologation-preload.cjs'));
 const {installNextEnv}=require('./next-env.cjs');const values=installNextEnv();
 require('./homologation-env.cjs').assertHomologation(values);
 console.log('Homologação: configuração isolada válida; .env e .env.local não carregados.');
 if(process.argv[2]!=='--check'){
  const cli=require.resolve('next/dist/bin/next');process.argv=[process.execPath,cli,'dev','--hostname','127.0.0.1','--port','3002'];require(cli);
 }
}catch{console.error('Homologação bloqueada: crie .env.homologacao com o endpoint isolado autorizado.');process.exitCode=1;}
