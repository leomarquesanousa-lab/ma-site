'use strict';
// Offline fixtures only: no real environment files, network, database, build or generation.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {assertHostedProduction}=require('./hosted-env.cjs');
const fixture={MA_HOSTED_PRODUCTION:'1',MA_RUNTIME:'production',NODE_ENV:'production',DATABASE_URL:'postgresql://fixture:placeholder@ep-soft-tooth-b62ei5ko-pooler.c-2.sa-east-1.aws.neon.tech/neondb',ASSET_STORAGE:'r2',R2_BUCKET:'maconfeccoes',R2_ACCOUNT_ID:'a'.repeat(32),R2_ACCESS_KEY_ID:'test-access',R2_SECRET_ACCESS_KEY:'test-secret'};
const secure=assertHostedProduction(fixture,'linux');assert.equal(new URL(secure.DATABASE_URL).searchParams.get('sslaccept'),'strict');assert.equal(secure.MA_HOMOLOGATION,'0');
for(const overrides of [{MA_HOMOLOGATION:'1'},{MA_RUNTIME:'homologation'},{NODE_ENV:'development'},{DATABASE_URL:fixture.DATABASE_URL.replace('soft-tooth-b62ei5ko','spring-fog-b6ux4ziv')},{R2_TEST_PREFIX:'homologacao/test-12345'},{R2_BUCKET:'wrong'},{SHADOW_DATABASE_URL:'unused',DATABASE_URL:''}])assert.throws(()=>assertHostedProduction({...fixture,...overrides},'linux'));
assert.throws(()=>assertHostedProduction(fixture,'win32'));
for(const [overrides,code]of [
 [{NODE_ENV:undefined},'HOSTED_NODE_ENV_INVALID'],
 [{MA_RUNTIME:undefined},'HOSTED_MA_RUNTIME_INVALID'],
 [{MA_HOMOLOGATION:'1'},'HOSTED_HOMOLOGATION_CONFLICT'],
 [{DATABASE_URL:'not-a-url'},'HOSTED_DATABASE_URL_INVALID'],
 [{DATABASE_URL:fixture.DATABASE_URL.replace('soft-tooth-b62ei5ko','spring-fog-b6ux4ziv')},'HOSTED_DATABASE_TARGET_INVALID'],
 [{R2_BUCKET:'wrong'},'HOSTED_R2_BUCKET_INVALID'],
 [{R2_SECRET_ACCESS_KEY:''},'HOSTED_R2_CONFIGURATION_INVALID']
])assert.throws(()=>assertHostedProduction({...fixture,...overrides},'linux'),error=>error.safeCode===code&&!error.message.includes(fixture.R2_SECRET_ACCESS_KEY));
const caCheck=evaluate('hosted-env.cjs',{'node:fs':{existsSync:()=>false}},{cwd:()=>process.cwd()});
assert.throws(()=>caCheck.assertHostedProduction(fixture,'linux'),error=>error.safeCode==='HOSTED_CA_MISSING');
function evaluate(file,stubs,proc){const m={exports:{}};const source=fs.readFileSync(path.join(__dirname,file),'utf8');vm.runInNewContext(source,{module:m,exports:m.exports,require:Object.assign(id=>id in stubs?(typeof stubs[id]==='function'?stubs[id]():stubs[id]):require(id),{resolve:require.resolve}),__dirname,process:proc,console:{log(){},error(...args){proc.errors?.push(args.join(" "));}},URL,Buffer,setTimeout,clearTimeout},{filename:file});return m.exports;}
let fileReads=0;const envProc={env:{...fixture},platform:'linux',cwd:()=>process.cwd()};const loader=evaluate('project-env.cjs',{'node:fs':{readFileSync(){fileReads++;throw Error('File read forbidden');}},'./hosted-env.cjs':{assertHostedProduction:v=>assertHostedProduction(v,'linux')}},envProc);loader.loadProjectEnv();loader.loadProjectEnv();assert.equal(fileReads,0);assert.equal(envProc.env.R2_SECRET_ACCESS_KEY,fixture.R2_SECRET_ACCESS_KEY);
const readPaths=[],localProc={env:{DATABASE_URL:'shell-must-not-win'},cwd:()=>process.cwd()};const local=evaluate('project-env.cjs',{'node:fs':{readFileSync:p=>{readPaths.push(path.basename(p));return 'DATABASE_URL=file-value';}}},localProc);local.loadProjectEnv();assert.equal(localProc.env.DATABASE_URL,'file-value');assert.deepEqual(readPaths,['.env']);
const hmlProc={env:{MA_HOMOLOGATION:'1'},cwd:()=>process.cwd()},hml=evaluate('project-env.cjs',{'node:fs':{readFileSync:p=>{assert.equal(path.basename(p),'.env.homologacao');return 'DATABASE_URL=isolated-fixture';}},'./homologation-env.cjs':{assertHomologation:v=>v.DATABASE_URL}},hmlProc);assert.equal(hml.loadProjectEnv().DATABASE_URL,'isolated-fixture');
function run(command,values,status=0,args=[]){const calls={spawn:[],next:0};const proc={errors:[],argv:['node','script',command,...args],env:{...fixture},execPath:process.execPath,cwd:()=>process.cwd()};evaluate('run-next.cjs',{'./next-env.cjs':{installNextEnv:()=>{if(values instanceof Error)throw values;return values;}},'node:child_process':{spawnSync:(...args)=>{calls.spawn.push(args);return {status};}},[path.resolve(__dirname,'../node_modules/next/dist/bin/next')]:()=>{calls.next++;}},proc);return {...calls,errors:proc.errors,argv:proc.argv,exitCode:proc.exitCode};}
let result=run('build',secure);assert.equal(result.spawn.length,1);assert.equal(result.spawn[0][1][1],'generate');assert.equal(result.next,1);assert.equal(result.exitCode,undefined);
assert.equal(result.argv.at(-1),'--webpack');
result=run('build',secure,0,['--turbopack']);assert.equal(result.exitCode,1);assert.equal(result.next,0);assert.equal(result.spawn.length,0);
result=run('build',secure,1);assert.equal(result.exitCode,1);assert.equal(result.next,0);
assert.match(result.errors.join(' '),/PRISMA_GENERATE_FAILED/);
const missingNodeEnv=Object.assign(Error('secret-must-never-appear'),{safeCode:'HOSTED_NODE_ENV_INVALID'});
result=run('build',missingNodeEnv);assert.equal(result.exitCode,1);assert.equal(result.spawn.length,0);assert.match(result.errors.join(' '),/HOSTED_NODE_ENV_INVALID/);assert.equal(result.errors.join(' ').includes(missingNodeEnv.message),false);
result=run('build',Error('secret-must-never-appear'));assert.match(result.errors.join(' '),/ENVIRONMENT_FAILED/);assert.equal(result.errors.join(' ').includes('secret-must-never-appear'),false);
result=run('dev',secure);assert.equal(result.exitCode,1);assert.equal(result.spawn.length,0);
result=run('start',secure);assert.equal(result.next,1);assert.equal(result.spawn.length,0);
assert.equal(result.argv.includes('--webpack'),false);
result=run('build',{MA_RUNTIME:'production',DATABASE_URL:fixture.DATABASE_URL});assert.equal(result.exitCode,1);assert.equal(result.next,0);assert.equal(result.spawn.length,0);
console.log('Hosted environment, TLS, destination isolation, no env file reads, local/homologation loading, generate-before-build, generation failure and dev guards: OK (offline mocks).');
const configSource=require('typescript').transpileModule(fs.readFileSync(path.join(__dirname,'../next.config.ts'),'utf8'),{compilerOptions:{module:require('typescript').ModuleKind.CommonJS}}).outputText;
function config(env){const m={exports:{}};vm.runInNewContext(configSource,{module:m,exports:m.exports,process:{env},require:id=>{
 if(id==='./scripts/next-env.cjs')return {installNextEnv(){}};
 if(id==='./scripts/local-db-target.cjs')return {assertLocalDatabaseUrl(){}};
 if(id==='./lib/commerce/neon')return {secureNeonUrl(){}};
 throw Error('Unexpected config import');
 }});return m.exports.default;}
const hostedConfig=config(fixture),patterns=hostedConfig.outputFileTracingExcludes['/*'];
const match=require('next/dist/compiled/picomatch');
const traceMatch=match(patterns.map(p=>path.posix.join('/project',p)),{dot:true});
for(const file of ['./.env','./.env.homologacao','./backups/neon/private.dump','./.npm-cache/snapshot/private','./.ma-neon-restore/cluster/data','./.ma-neon-activation/stage/config.ts','./validation-guard.cjs'])assert.equal(traceMatch(path.posix.join('/project',file)),true,file);
for(const file of ['./prisma/certs/neon-root-ca.pem','./node_modules/.prisma/client/index.js','./scripts/hosted-env.cjs'])assert.equal(traceMatch(path.posix.join('/project',file)),false,file);
assert.equal(config({MA_HOMOLOGATION:'1',MA_RUNTIME:'homologation'}).outputFileTracingExcludes,undefined);
console.log('Hosted-only tracing exclusions protect private files and preserve public CA, Prisma Client and homologation config: OK (offline config evaluation).');
