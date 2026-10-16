'use strict';
// Explicit incremental release executor. --check is offline; --apply needs a fresh proven backup and interactive authorization.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),name='202610150002_category_seo',host='ep-soft-tooth-b62ei5ko.c-2.sa-east-1.aws.neon.tech';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function fail(code){throw Error(code);}
function plan(){
 const baseline=JSON.parse(fs.readFileSync(path.join(root,'prisma/neon-activation-plan.json'),'utf8'));
 if(hash(fs.readFileSync(path.join(root,'prisma/certs/neon-root-ca.pem')))!==baseline.caSha256)fail('TRUSTED_CA_CHANGED');
 const names=['202610130001_auth_baseline','202610140001_commerce','202610150001_studio',name];
 if(JSON.stringify(fs.readdirSync(path.join(root,'prisma/migrations'),{withFileTypes:true}).filter(d=>d.isDirectory()).map(d=>d.name).sort())!==JSON.stringify(names))fail('MIGRATION_CHAIN_CHANGED');
 const sql=fs.readFileSync(path.join(root,'prisma/migrations',name,'migration.sql'));
 if(!sql.equals(fs.readFileSync(path.join(root,'prisma/homologation-migrations',name,'migration.sql'))))fail('SEO_CHECKSUM_CHANGED');
 if(sql.toString().replace(/--[^\r\n]*/g,'').replace(/\s+/g,' ').trim()!==`BEGIN; ALTER TABLE "public"."Category" ADD COLUMN "seoTitle" TEXT NOT NULL DEFAULT '', ADD COLUMN "seoDescription" TEXT NOT NULL DEFAULT ''; COMMIT;`)fail('SQL_NOT_APPROVED');
 for(const m of baseline.migrations)if(hash(fs.readFileSync(path.join(root,'prisma/migrations',m.name,'migration.sql')))!==m.sha256)fail('BASELINE_CHECKSUM_CHANGED');
 if(baseline.project!=='maconfeccoes'||baseline.directHostname!==host||baseline.database!=='neondb'||baseline.schema!=='public'||JSON.stringify(baseline.migrations.map(m=>m.name))!==JSON.stringify(names.slice(0,3)))fail('BASELINE_PLAN_CHANGED');
 return {baseline,checksum:hash(sql)};
}
function backup(file){
 const base=fs.realpathSync(path.join(root,'backups')),manifestPath=fs.realpathSync(path.resolve(root,file));
 if(!manifestPath.startsWith(base+path.sep))fail('BACKUP_PATH_BLOCKED');
 const m=JSON.parse(fs.readFileSync(manifestPath,'utf8')),age=Date.now()-Date.parse(m.createdAt),restoreAge=Date.now()-Date.parse(m.restoreTest?.verifiedAt);
 if(m.project!=='maconfeccoes'||m.branch!=='production'||m.hostname!==host||m.database!=='neondb'||m.schema!=='public'||!Number.isFinite(age)||age<0||age>=86400000||m.restoreTest?.isolated!==true||m.restoreTest?.passed!==true||m.restoreTest?.backupSha256!==m.sha256||!Number.isFinite(restoreAge)||restoreAge<0||restoreAge>age||restoreAge>=86400000)fail('BACKUP_OR_RESTORE_NOT_VALID');
 const dump=fs.realpathSync(path.resolve(root,m.dumpFile));if(!dump.startsWith(base+path.sep))fail('DUMP_PATH_BLOCKED');
 const bytes=fs.readFileSync(dump);if(bytes.subarray(0,5).toString()!=='PGDMP'||hash(bytes)!==m.sha256)fail('BACKUP_CHECKSUM_FAILED');
}
async function main(){
 const args=process.argv.slice(2),approved=plan();
 if(args.length===1&&args[0]==='--check'){console.log('SEO_PRODUCTION_PLAN_OK_OFFLINE',approved.checksum);return;}
 if(args.length!==3||args[0]!=='--apply'||args[1]!=='--backup-manifest'||!process.stdin.isTTY||!process.stdout.isTTY)fail('EXPLICIT_APPLY_AND_INTERACTIVE_TERMINAL_REQUIRED');
 backup(args[2]);
 if(process.env.MA_HOMOLOGATION==='1')fail('HOMOLOGATION_NOT_ALLOWED');
 const values=require('./project-env.cjs').readProjectEnv();if(values.MA_RUNTIME==='homologation'||values.MA_HOMOLOGATION==='1')fail('HOMOLOGATION_NOT_ALLOWED');
 const u=new URL(values.DATABASE_URL);if(!['postgres:','postgresql:'].includes(u.protocol)||![host,host.replace('.c-2.','-pooler.c-2.')].includes(u.hostname)||u.pathname!=='/neondb'||!u.username||!u.password||u.hash||(u.port&&u.port!=='5432')||(u.searchParams.has('schema')&&u.searchParams.get('schema')!=='public'))fail('PRODUCTION_TARGET_MISMATCH');
 u.hostname=host;u.searchParams.delete('pgbouncer');u.searchParams.delete('channel_binding');u.searchParams.set('schema','public');u.searchParams.set('sslmode','require');u.searchParams.set('sslaccept','strict');u.searchParams.set('sslcert',path.join(root,'prisma/certs/neon-root-ca.pem'));u.searchParams.set('connect_timeout','10');u.searchParams.set('socket_timeout','15');
 const {PrismaClient}=require('@prisma/client'),db=new PrismaClient({datasources:{db:{url:u.href}},log:[]});
 async function preflight(){await db.$transaction(async tx=>{
  await tx.$executeRawUnsafe('SET TRANSACTION READ ONLY');
  const identity=await tx.$queryRawUnsafe('SELECT current_database() AS database,current_schema() AS schema');if(identity[0]?.database!=='neondb'||identity[0]?.schema!=='public')fail('DATABASE_IDENTITY_MISMATCH');
  const history=await tx.$queryRawUnsafe('SELECT migration_name,checksum,finished_at,rolled_back_at FROM public."_prisma_migrations" ORDER BY migration_name');
  if(history.length!==3||history.some((h,i)=>h.migration_name!==approved.baseline.migrations[i].name||h.checksum!==approved.baseline.migrations[i].sha256||!h.finished_at||h.rolled_back_at))fail('HISTORY_NOT_EXPECTED_STOP');
  const cols=await tx.$queryRawUnsafe("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='Category' AND column_name IN ('seoTitle','seoDescription')");if(cols.length)fail('ALREADY_APPLIED_OR_PARTIAL_STOP');
 },{timeout:20000});}
 let stage;
 try{
  await preflight();
  const rl=require('node:readline/promises').createInterface({input:process.stdin,output:process.stdout});let answer;try{answer=await rl.question('Destino maconfeccoes/neondb/public. Digite AUTORIZO SEO maconfeccoes/neondb/public '+approved.checksum.slice(0,12)+': ');}finally{rl.close();}
  if(answer!=='AUTORIZO SEO maconfeccoes/neondb/public '+approved.checksum.slice(0,12))fail('AUTHORIZATION_MISSING');
  backup(args[2]);plan();await preflight();
  const stageBase=path.join(root,'.ma-neon-activation');fs.mkdirSync(stageBase,{recursive:true});if(fs.realpathSync(stageBase).toLowerCase()!==stageBase.toLowerCase())fail('STAGING_PATH_BLOCKED');
  stage=fs.mkdtempSync(path.join(stageBase,'production-seo-'));
  const token=crypto.randomBytes(32).toString('hex'),config=path.join(stage,'prisma.config.ts');
  fs.writeFileSync(config,`import {defineConfig} from 'prisma/config';import {createHash} from 'node:crypto';if(process.ppid!==${process.pid}||createHash('sha256').update(process.env.MA_SEO_TOKEN??'').digest('hex')!=='${hash(token)}'||process.argv[2]!=='migrate'||process.argv[3]!=='deploy')throw Error('Restricted SEO executor');export default defineConfig({schema:${JSON.stringify(path.join(root,'prisma/schema.prisma'))},migrations:{path:${JSON.stringify(path.join(root,'prisma/migrations'))}},datasource:{url:process.env.DATABASE_URL!}});`);
  const {spawnSync}=require('node:child_process'),result=spawnSync(process.execPath,[require.resolve('prisma/build/index.js'),'migrate','deploy','--config',config],{cwd:root,env:{...process.env,NODE_OPTIONS:'',DATABASE_URL:u.href,DIRECT_URL:'',SHADOW_DATABASE_URL:'',MA_HOMOLOGATION:'0',MA_SEO_TOKEN:token},stdio:'pipe',timeout:120000,windowsHide:true});
  if(result.error||result.status!==0)fail('MIGRATION_FAILED_STOP_NO_RETRY');
  const rows=await db.$queryRawUnsafe('SELECT migration_name,checksum,finished_at,rolled_back_at FROM public."_prisma_migrations" ORDER BY migration_name');
  if(rows.length!==4||rows.some((h,i)=>h.migration_name!==(i===3?name:approved.baseline.migrations[i].name)||h.checksum!==(i===3?approved.checksum:approved.baseline.migrations[i].sha256)||!h.finished_at||h.rolled_back_at))fail('POSTCHECK_FAILED');
  await db.$queryRawUnsafe('SELECT "seoTitle","seoDescription" FROM public."Category" LIMIT 0');console.log('PRODUCTION_SEO_APPLIED_AND_VERIFIED');
 }finally{await db.$disconnect();if(stage){const resolved=fs.realpathSync(stage);if(resolved.toLowerCase()===stage.toLowerCase()&&path.dirname(stage)===path.join(root,'.ma-neon-activation'))fs.rmSync(stage,{recursive:true});}}
}
if(require.main===module)main().catch(e=>{console.error('PRODUCTION_SEO_STOP',/^[A-Z_]+$/.test(e.message)?e.message:'CHECK_FAILED');process.exitCode=1;});
module.exports={plan,backup,main};
