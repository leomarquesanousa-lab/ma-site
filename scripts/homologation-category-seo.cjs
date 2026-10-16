'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
const root=process.cwd(),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function fail(code){throw Error(code);}
async function main(){
 if(process.argv.length!==3||process.argv[2]!=='--apply')fail('EXPLICIT_APPLY_REQUIRED');
 process.env.MA_HOMOLOGATION='1';const env=require('./project-env.cjs').loadProjectEnv(),u=new URL(env.DATABASE_URL);
 if(u.hostname!=='ep-spring-fog-b6ux4ziv-pooler.c-2.sa-east-1.aws.neon.tech')fail('HOMOLOGATION_ENDPOINT_MISMATCH');
 u.hostname=u.hostname.replace('-pooler.','.');u.searchParams.delete('channel_binding');u.searchParams.delete('pgbouncer');
 const name='202610150002_category_seo',sql=fs.readFileSync(path.join(root,'prisma/homologation-migrations',name,'migration.sql'));
 const reviewed=`BEGIN; ALTER TABLE "public"."Category" ADD COLUMN "seoTitle" TEXT NOT NULL DEFAULT '', ADD COLUMN "seoDescription" TEXT NOT NULL DEFAULT ''; COMMIT;`;
 if(sql.toString().replace(/--[^\r\n]*/g,'').replace(/\s+/g,' ').trim()!==reviewed)fail('SQL_NOT_REVIEWED');
 const plan=JSON.parse(fs.readFileSync('prisma/neon-activation-plan.json','utf8'));
 const approved=plan.migrations.map(m=>{const bytes=fs.readFileSync(path.join('prisma/migrations',m.name,'migration.sql'));if(hash(bytes)!==m.sha256)fail('BASELINE_CHECKSUM_CHANGED');return {...m,bytes};});
 const {PrismaClient}=require('@prisma/client'),db=new PrismaClient({datasources:{db:{url:u.href}},log:[]});let stage;
 async function preflight(){const id=await db.$queryRawUnsafe('SELECT current_database() AS database,current_schema() AS schema');if(id[0].database!=='neondb'||id[0].schema!=='public')fail('DATABASE_IDENTITY');const columns=await db.$queryRawUnsafe("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='Category' AND column_name IN ('seoTitle','seoDescription')");const history=await db.$queryRawUnsafe('SELECT migration_name,checksum,finished_at,rolled_back_at FROM public."_prisma_migrations" ORDER BY started_at');if(columns.length||history.some(h=>h.migration_name===name))fail('ALREADY_APPLIED_OR_PARTIAL_STOP');if(history.length!==3||history.some((h,i)=>h.migration_name!==approved[i].name||h.checksum!==approved[i].sha256||!h.finished_at||h.rolled_back_at))fail('BASELINE_HISTORY_MISMATCH');}
 try{
  await preflight();
  const backupDir=path.join(root,'backups/homologation');fs.mkdirSync(backupDir,{recursive:true,mode:0o700});if(fs.realpathSync(backupDir).toLowerCase()!==backupDir.toLowerCase())fail('BACKUP_DIRECTORY_REFUSED');
  const pgEnv={...process.env};for(const k of Object.keys(pgEnv))if(k.startsWith('PG'))delete pgEnv[k];Object.assign(pgEnv,{PGHOST:u.hostname,PGPORT:'5432',PGUSER:decodeURIComponent(u.username),PGPASSWORD:decodeURIComponent(u.password),PGDATABASE:'neondb',PGSSLMODE:'verify-full',PGSSLROOTCERT:path.join(root,'prisma/certs/neon-root-ca.pem'),PGCHANNELBINDING:'require',PGCONNECT_TIMEOUT:'10',PGOPTIONS:'-c default_transaction_read_only=on'});
  const bin='C:/Program Files/PostgreSQL/18/bin/';const dump=spawnSync(bin+'pg_dump.exe',['--no-password','--format=custom','--schema=public','--no-owner','--no-acl'],{env:pgEnv,encoding:null,windowsHide:true,timeout:60000,maxBuffer:67108864});pgEnv.PGPASSWORD='';if(dump.error||dump.status!==0||dump.stdout?.subarray(0,5).toString()!=='PGDMP')fail('BACKUP_FAILED');
  const prefix='pre-category-seo-'+crypto.randomUUID(),backup=path.join(backupDir,prefix+'.dump');fs.writeFileSync(backup,dump.stdout,{flag:'wx',mode:0o600});
  const listing=spawnSync(bin+'pg_restore.exe',['--list',backup],{encoding:'utf8',windowsHide:true,timeout:10000});if(listing.status!==0)fail('BACKUP_ARCHIVE_INVALID');
  fs.writeFileSync(path.join(backupDir,prefix+'.json'),JSON.stringify({project:'maconfeccoes',branch:'homologation',database:'neondb',schema:'public',createdAt:new Date().toISOString(),sha256:hash(dump.stdout),migration:name,migrationSha256:hash(sql),archiveValidated:true,restoreTest:'NOT_PERFORMED',recovery:'Restore only into a separately authorized isolated empty target; never clean production.'},null,2),{flag:'wx',mode:0o600});
  console.log('HOMOLOGATION_BACKUP_CREATED_AND_ARCHIVE_VALIDATED');await preflight();
  stage=path.join(root,'.ma-neon-activation','hml-'+crypto.randomUUID());fs.mkdirSync(path.join(stage,'migrations'),{recursive:true,mode:0o700});if(fs.realpathSync(stage).toLowerCase()!==stage.toLowerCase())fail('STAGING_PATH_REFUSED');
  for(const m of [...approved,{name,bytes:sql}]){fs.mkdirSync(path.join(stage,'migrations',m.name));fs.writeFileSync(path.join(stage,'migrations',m.name,'migration.sql'),m.bytes);}
  fs.copyFileSync('prisma/migrations/migration_lock.toml',path.join(stage,'migrations/migration_lock.toml'));fs.copyFileSync('prisma/schema.prisma',path.join(stage,'schema.prisma'));
  const token=crypto.randomBytes(32).toString('hex'),config=path.join(stage,'prisma.config.ts');
  fs.writeFileSync(config,`import {defineConfig} from 'prisma/config';import {createHash} from 'node:crypto';if(process.ppid!==${process.pid}||createHash('sha256').update(process.env.MA_HML_TOKEN??'').digest('hex')!=='${hash(token)}'||process.argv[2]!=='migrate'||process.argv[3]!=='deploy')throw Error('Restricted command');export default defineConfig({schema:'schema.prisma',migrations:{path:'migrations'},datasource:{url:process.env.DATABASE_URL!}});`);
  const result=spawnSync(process.execPath,['node_modules/prisma/build/index.js','migrate','deploy','--config',config],{cwd:root,env:{...process.env,NODE_OPTIONS:'',DATABASE_URL:u.href,DIRECT_URL:'',SHADOW_DATABASE_URL:'',MA_HML_TOKEN:token,PRISMA_SCHEMA_ENGINE_BINARY:path.join(root,'node_modules/@prisma/engines/schema-engine-windows.exe')},encoding:'utf8',windowsHide:true,timeout:120000});if(result.error||result.status!==0)fail('DEPLOY_FAILED_NO_RETRY');
  const after=await db.$queryRawUnsafe('SELECT migration_name,checksum,finished_at,rolled_back_at FROM public."_prisma_migrations" WHERE migration_name=\'202610150002_category_seo\'');if(after.length!==1||after[0].checksum!==hash(sql)||!after[0].finished_at||after[0].rolled_back_at)fail('POSTCHECK_HISTORY_FAILED');
  await db.$queryRawUnsafe('SELECT "seoTitle","seoDescription" FROM public."Category" LIMIT 0');console.log('HOMOLOGATION_CATEGORY_SEO_APPLIED_AND_VERIFIED');
 }finally{await db.$disconnect();if(stage&&fs.realpathSync(stage).toLowerCase()===stage.toLowerCase()&&path.dirname(stage)===path.join(root,'.ma-neon-activation'))fs.rmSync(stage,{recursive:true,force:true});}
}
main().catch(e=>{console.error('HOMOLOGATION_SEO_STOP',/^[A-Z_]+$/.test(e.message)?e.message:'CHECK_FAILED');process.exitCode=1;});
