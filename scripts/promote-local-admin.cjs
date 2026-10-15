'use strict';
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const readline=require('node:readline/promises');
const {spawnSync}=require('node:child_process');
const {target,assertLocalDatabaseUrl}=require('./local-db-target.cjs');
const {passwordPrompt}=require('./local-password.cjs');
const root=path.resolve(__dirname,'..');
const reportPath=path.join(root,'.ma-local-admin-result.json');
const report={status:'PREPARING',localVerified:false,matchedAccounts:null,previousRole:null,rowsChanged:0,role:null};
function publish(){fs.writeFileSync(reportPath,JSON.stringify(report,null,2),{mode:0o600});}
function stop(code){const error=new Error(code);error.safeCode=code;throw error;}
function query(env,sql,readOnly=true){
  const result=spawnSync('C:/Program Files/PostgreSQL/18/bin/psql.exe',['-X','-w','-q','-h',target.host,'-p',target.port,'-U',target.username,'-d',target.database,'-A','-t','-v','ON_ERROR_STOP=1','-f','-'],{cwd:root,env:{...env,PGHOSTADDR:target.host,PGCONNECT_TIMEOUT:'5',PGOPTIONS:`-c default_transaction_read_only=${readOnly?'on':'off'} -c statement_timeout=15000`},input:sql,encoding:'utf8',timeout:20000,windowsHide:true});
  if(result.error||result.status!==0)stop(readOnly?'LOCAL_READ_FAILED':'PROMOTION_FAILED_NO_RETRY');
  try{return JSON.parse(result.stdout.trim());}catch{stop('UNEXPECTED_LOCAL_RESULT');}
}
async function main(){
  publish();
  if(process.argv.length!==2)stop('ARGUMENTS_NOT_ALLOWED');
  const config=JSON.parse(fs.readFileSync(path.join(root,'.ma-commerce.local.json'),'utf8').replace(/^\uFEFF/,''));
  if(!config||Object.keys(config).length!==Object.keys(target).length||Object.entries(target).some(([k,v])=>String(config[k])!==v))stop('LOCAL_CONFIG_MISMATCH');
  if(!process.stdin.isTTY||!process.stdout.isTTY)stop('INTERACTIVE_TERMINAL_REQUIRED');
  report.status='WAITING_FOR_OPERATOR';publish();
  console.log('Somente 127.0.0.1:5432 / ma_commerce_local / ma_commerce_dev. Nenhuma conta será criada.');
  const terminal=readline.createInterface({input:process.stdin,output:process.stdout});
  let email;try{email=(await terminal.question('E-mail da sua conta local: ')).trim().toLowerCase();}finally{terminal.close();}
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)stop('INVALID_ACCOUNT_IDENTIFIER');
  let password=await passwordPrompt();
  const env=Object.fromEntries(Object.entries(process.env).filter(([k])=>!/^PG|^PRISMA_/i.test(k)));
  env.DATABASE_URL=assertLocalDatabaseUrl(`postgresql://${target.username}:${encodeURIComponent(password)}@${target.host}:${target.port}/${target.database}?schema=${target.schema}`);
  env.PGPASSWORD=password;password='';env.MA_OPERATOR_EMAIL=email;email='';
  try{
    report.status='VERIFYING';publish();
    const identitySql=`'user',current_user,'database',current_database(),'address',inet_server_addr(),'port',inet_server_port()`;
    const pre=query(env,`\\getenv operator_email MA_OPERATOR_EMAIL
SELECT json_build_object(${identitySql},'count',(SELECT count(*) FROM public."User" WHERE email=:'operator_email'),'account',(SELECT json_build_object('id',id,'role',role) FROM public."User" WHERE email=:'operator_email' LIMIT 1));`);
    if(pre.user!==target.username||pre.database!==target.database||pre.address!==target.host||pre.port!==Number(target.port))stop('LOCAL_IDENTITY_MISMATCH');
    report.localVerified=true;report.matchedAccounts=pre.count;report.previousRole=pre.account?.role??null;publish();
    if(pre.count!==1)stop('ACCOUNT_COUNT_MUST_BE_ONE');
    if(pre.account.role!=='CUSTOMER')stop('ACCOUNT_MUST_BE_CUSTOMER');
    env.MA_TARGET_ID=pre.account.id;env.MA_AUDIT_ID=crypto.randomUUID();
    assertLocalDatabaseUrl(env.DATABASE_URL);
    report.status='PROMOTING';publish();
    const updated=query(env,`\\getenv operator_email MA_OPERATOR_EMAIL
\\getenv target_id MA_TARGET_ID
\\getenv audit_id MA_AUDIT_ID
BEGIN ISOLATION LEVEL SERIALIZABLE;
SET LOCAL lock_timeout='5s';
SELECT 1/(CASE WHEN current_user='ma_commerce_dev' AND current_database()='ma_commerce_local' AND inet_server_addr()='127.0.0.1'::inet AND inet_server_port()=5432 THEN 1 ELSE 0 END) AS local_guard \\gset
WITH candidate AS (SELECT id FROM public."User" WHERE id=:'target_id' AND email=:'operator_email' AND role='CUSTOMER' FOR UPDATE),
changed AS (UPDATE public."User" SET role='ADMIN',"updatedAt"=CURRENT_TIMESTAMP WHERE id IN (SELECT id FROM candidate) AND (SELECT count(*) FROM candidate)=1 RETURNING id,role),
logged AS (INSERT INTO public."AuditLog" (id,"actorId",action,entity,"entityId",detail,"createdAt") SELECT :'audit_id','local-bootstrap:ma_commerce_dev','PROMOTE_LOCAL_ADMIN','User',id,jsonb_build_object('from','CUSTOMER','to','ADMIN','source','authorized-local-operator'),CURRENT_TIMESTAMP FROM changed RETURNING id)
SELECT json_build_object('changed',(SELECT count(*) FROM changed),'logged',(SELECT count(*) FROM logged));
COMMIT;`,false);
    if(updated.changed!==1||updated.logged!==1)stop('ACCOUNT_CHANGED_CONCURRENTLY_NO_PROMOTION');
    report.rowsChanged=1;
    const post=query(env,`\\getenv target_id MA_TARGET_ID
SELECT json_build_object(${identitySql},'role',(SELECT role FROM public."User" WHERE id=:'target_id'));`);
    if(post.user!==target.username||post.database!==target.database||post.address!==target.host||post.port!==Number(target.port)||post.role!=='ADMIN')stop('POSTFLIGHT_MISMATCH');
    report.role='ADMIN';report.status='COMPLETE';publish();
    console.log('Concluído: exatamente uma conta CUSTOMER promovida a ADMIN no banco local, com auditoria. Nenhuma outra conta alterada.');
  }finally{env.PGPASSWORD='';env.DATABASE_URL='';env.MA_OPERATOR_EMAIL='';env.MA_TARGET_ID='';env.MA_AUDIT_ID='';}
}
main().catch(error=>{report.status='STOPPED';report.error=error.safeCode??'LOCAL_ADMIN_OPERATION_STOPPED';publish();console.error('Operação interrompida:',report.error);process.exitCode=1;});
