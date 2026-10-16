'use strict';
// Restores only into a NEW, private local cluster; never connects to Neon.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),net=require('node:net');
const {spawnSync}=require('node:child_process');
const {prepare,hash,root}=require('./neon-migration-plan.cjs');
async function main(){
 if(process.argv.length!==3||process.argv[2]!=='--run')throw Error('USE --run');
 const p=prepare(),file=path.join(root,'backups/neon/pre-migration.manifest.json'),m=JSON.parse(fs.readFileSync(file,'utf8'));
 const dump=path.join(root,'backups/neon/pre-migration.dump');
 if(m.planHash!==p.planHash||m.sha256!==hash(fs.readFileSync(dump))||m.project!=='maconfeccoes'||m.emptySource!==true)throw Error('BACKUP_MISMATCH');
 const base=path.join(root,'.ma-neon-restore');
 fs.mkdirSync(base,{recursive:true});if(fs.realpathSync(base)!==base)throw Error('RESTORE_DIRECTORY_REFUSED');
 const work=fs.mkdtempSync(path.join(base,'rehearsal-')),data=path.join(work,'data');
 const secretDir=fs.mkdtempSync(path.join(os.tmpdir(),'ma-restore-secret-')),pwfile=path.join(secretDir,'password');
 const password=crypto.randomBytes(32).toString('hex');fs.writeFileSync(pwfile,password,{mode:0o600,flag:'wx'});
 const port=await new Promise((resolve,reject)=>{const s=net.createServer();s.on('error',reject);s.listen(0,'127.0.0.1',()=>{const n=s.address().port;s.close(()=>resolve(n));});});
 const env={...process.env};for(const k of Object.keys(env))if(k.startsWith('PG'))delete env[k];
 Object.assign(env,{PGHOST:'127.0.0.1',PGPORT:String(port),PGUSER:'ma_restore_operator',PGPASSWORD:password,PGDATABASE:'postgres',PGCONNECT_TIMEOUT:'5'});
 // TLS remains strict for Neon. This fresh local loopback-only cluster uses SCRAM.
 const bin='C:/Program Files/PostgreSQL/18/bin/';
 function run(exe,args){const r=spawnSync(bin+exe+'.exe',args,{env,encoding:'utf8',stdio:exe==='pg_ctl'?'ignore':'pipe',windowsHide:true,timeout:60000,maxBuffer:4194304});if(r.error||r.status!==0)throw Error(exe.toUpperCase()+'_FAILED');return r.stdout;}
 let started=false;
 try{
  run('initdb',['-D',data,'-U','ma_restore_operator','--auth=scram-sha-256','--pwfile='+pwfile,'--encoding=UTF8','--locale=C']);
  fs.unlinkSync(pwfile);fs.rmdirSync(secretDir);
  started=true;run('pg_ctl',['-D',data,'-l',path.join(work,'server.log'),'-o',`-h 127.0.0.1 -p ${port}`,'-w','start']);started=true;
  const before=run('psql',['-X','-A','-t','-v','ON_ERROR_STOP=1','-c',"SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind IN ('r','p','v','m','S','f')"]);
  if(before.trim()!=='0')throw Error('ISOLATED_TARGET_NOT_EMPTY');
  const toc=run('pg_restore',['--list',dump]);const entries=toc.split(/\r?\n/);const schemaEntries=entries.filter(l=>/^\d+; 2615 \d+ SCHEMA - public /.test(l));if(schemaEntries.length!==1)throw Error('UNEXPECTED_SCHEMA_ENTRIES');const list=path.join(work,'restore.list');fs.writeFileSync(list,entries.filter(l=>!schemaEntries.includes(l)).join('\n'));run('pg_restore',['--no-password','--exit-on-error','--no-owner','--no-acl','--use-list='+list,'--dbname=postgres',dump]);
  const after=run('psql',['-X','-A','-t','-v','ON_ERROR_STOP=1','-c',"SELECT current_database(),(SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind IN ('r','p','v','m','S','f'))"]);
  if(after.trim()!=='postgres|0')throw Error('RESTORED_INVENTORY_MISMATCH');
  run('pg_ctl',['-D',data,'-m','fast','-w','stop']);started=false;
  m.restoreTest={isolated:true,passed:true,verifiedAt:new Date().toISOString(),method:'pg_restore --exit-on-error; new local PostgreSQL 18 SCRAM cluster; loopback only; stopped',tables:0,existingPublicSchema:'preserved; only duplicate CREATE SCHEMA public TOC entry excluded; archive unchanged'};
  fs.writeFileSync(file,JSON.stringify(m,null,2)+'\n');
  console.log(JSON.stringify({restore:'VALIDATED',target:'new isolated local cluster',tables:0,server:'STOPPED',manifest:'UPDATED',neonWrites:false}));
 }finally{
  if(started)run('pg_ctl',['-D',data,'-m','fast','-w','stop']);
  if(fs.existsSync(pwfile))fs.unlinkSync(pwfile);if(fs.existsSync(secretDir))fs.rmdirSync(secretDir);
  env.PGPASSWORD='';
 }
}
main().catch(e=>{console.error('RESTORE_REHEARSAL_FAILED:',/^[A-Z_ -]+$/.test(e.message)?e.message:'CHECK_FAILED');process.exitCode=1;});
