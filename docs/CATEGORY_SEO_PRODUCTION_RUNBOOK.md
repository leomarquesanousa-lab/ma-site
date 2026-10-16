# Category SEO — preparação de produção

Preparado em 16/10/2026. Comandos abaixo NÃO executados. Não usar os scripts neon-backup.cjs/neon-restore-rehearsal.cjs: foram escritos para o estado inicial vazio e não são compatíveis com esta etapa.

## Revisão concluída

SQL oficial e de homologação idênticos. Consulta somente leitura na homologação confirmou uma entrada concluída, não revertida, com SHA-256 `0801c88c13c254340e3a3878584672d9f7a8694e6b150cfb7f6226e93163227e`.

```sql
BEGIN;
ALTER TABLE "public"."Category"
  ADD COLUMN "seoTitle" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "seoDescription" TEXT NOT NULL DEFAULT '';
COMMIT;
```

Somente Category recebe duas colunas. Registros existentes passam a ler string vazia nesses campos. Não há DROP, DELETE, UPDATE, índice ou tabela de aplicação nova. Prisma registra a quarta migration em _prisma_migrations durante a aplicação futura.

pg_dump e pg_restore 18.6 disponíveis em C:/Program Files/PostgreSQL/18/bin (não encontrados no PATH). Executor production-category-seo.cjs --check e fixtures check-production-category-seo.cjs passaram. A tentativa de leitura no sandbox falhou com P1011; a mesma consulta fora dele passou com TLS estrito, sem alterações de certificado.

## Pré-requisitos

Autorizar separadamente backup, ensaio local e aplicação. Impedir alterações concorrentes durante a janela; ter espaço e proteção de acesso para backups, que podem conter dados pessoais e NÃO são criptografados pelo formato custom. Confirmar versão do servidor: pg_dump 18 não aceita servidor PostgreSQL de major superior. Manter CA pública revisada e .env exclusivo; não usar .env.local. Executar em terminal normal com certificados confiáveis disponíveis. Não alterar sslmode/validação para contornar erros.

## 1. Checks offline

Em C:\Projetos\ma-site:

```powershell
node scripts/production-category-seo.cjs --check
node scripts/check-production-category-seo.cjs
& 'C:/Program Files/PostgreSQL/18/bin/pg_dump.exe' --version
& 'C:/Program Files/PostgreSQL/18/bin/pg_restore.exe' --version
```

## 2. Backup futuro — somente depois de autorização

O bloco lê .env diretamente, recusa outro endpoint, passa credenciais somente ao ambiente do subprocesso, usa conexão direct/TLS verify-full e sessão read-only. Não imprimir ambiente ou stderr bruto. Não sobrescreve backups. Se houver falha após criar o dump, preservar os arquivos e interromper; não repetir cegamente.

```powershell
@'
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {parseEnv}=require('node:util'),{spawnSync}=require('node:child_process');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
try {
 require('./scripts/production-category-seo.cjs').plan();
 const v=parseEnv(fs.readFileSync('.env','utf8').replace(/^\uFEFF/,''));
 const u=new URL(v.DATABASE_URL),host='ep-soft-tooth-b62ei5ko.c-2.sa-east-1.aws.neon.tech';
 if(!['postgres:','postgresql:'].includes(u.protocol)||![host,host.replace('.c-2.','-pooler.c-2.')].includes(u.hostname)||u.pathname!=='/neondb'||!u.username||!u.password||u.hash||(u.port&&u.port!=='5432')||(u.searchParams.has('schema')&&u.searchParams.get('schema')!=='public'))throw Error();
 const dumpFile='backups/neon/pre-category-seo.dump',manifestFile='backups/neon/pre-category-seo.manifest.json';
 if(fs.existsSync(dumpFile)||fs.existsSync(manifestFile))throw Error();
 const dir=path.resolve('backups/neon');fs.mkdirSync(dir,{recursive:true});
 if(fs.realpathSync(dir).toLowerCase()!==dir.toLowerCase())throw Error();
 const env={...process.env};for(const k of Object.keys(env))if(k.startsWith('PG'))delete env[k];
 Object.assign(env,{PGHOST:host,PGPORT:'5432',PGDATABASE:'neondb',PGUSER:decodeURIComponent(u.username),PGPASSWORD:decodeURIComponent(u.password),PGSSLMODE:'verify-full',PGSSLROOTCERT:path.resolve('prisma/certs/neon-root-ca.pem'),PGCHANNELBINDING:'require',PGCONNECT_TIMEOUT:'10',PGOPTIONS:'-c default_transaction_read_only=on'});
 const r=spawnSync('C:/Program Files/PostgreSQL/18/bin/pg_dump.exe',['--no-password','--format=custom','--schema=public','--no-owner','--no-acl'],{env,encoding:null,windowsHide:true,timeout:300000,maxBuffer:536870912});env.PGPASSWORD='';
 if(r.error||r.status!==0||r.stdout?.subarray(0,5).toString()!=='PGDMP')throw Error();
 fs.writeFileSync(dumpFile,r.stdout,{flag:'wx',mode:0o600});
 fs.writeFileSync(manifestFile,JSON.stringify({project:'maconfeccoes',branch:'production',hostname:host,database:'neondb',schema:'public',createdAt:new Date().toISOString(),dumpFile,sha256:hash(r.stdout),restoreTest:{isolated:true,passed:false,verifiedAt:null}},null,2),{flag:'wx',mode:0o600});
 console.log('BACKUP_CREATED_RESTORE_PENDING');
}catch{console.error('BACKUP_STOP_REVIEW_WITHOUT_RETRY');process.exitCode=1;}
'@ | node
if ($LASTEXITCODE -ne 0) { throw 'Backup interrompido' }
& 'C:/Program Files/PostgreSQL/18/bin/pg_restore.exe' --list backups/neon/pre-category-seo.dump
if ($LASTEXITCODE -ne 0) { throw 'Arquivo de backup inválido' }
```

Limite deste comando: dump em memória até 512 MiB. Se exceder, interromper e preparar streaming seguro; não diminuir o conteúdo do backup. O dump abrange somente public, não roles globais, outros schemas nem objetos R2.

## 3. Ensaio futuro em cluster local NOVO

Não reutilizar bancos locais existentes. O bloco não recebe URL remota. Usa cluster novo, usuário distinto, senha aleatória efêmera, SCRAM e loopback. Nenhuma proteção TLS de Neon é alterada. Porta ocupada faz pg_ctl falhar, sem conectar em outro serviço. O atestado só é gravado depois da restauração, checagem de tabelas/enums/histórico e parada do cluster.

```powershell
@'
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),net=require('node:net');
const {spawnSync}=require('node:child_process'),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
 let started=false,work,pwfile;
 const env={...process.env};for(const k of Object.keys(env))if(k.startsWith('PG'))delete env[k];
 const bin='C:/Program Files/PostgreSQL/18/bin/';
 function run(exe,args){const r=spawnSync(bin+exe+'.exe',args,{env,encoding:'utf8',windowsHide:true,stdio:exe==='pg_ctl'?'ignore':'pipe',timeout:300000,maxBuffer:16777216});if(r.error||r.status!==0)throw Error();return r.stdout;}
 try {
  const file='backups/neon/pre-category-seo.manifest.json',m=JSON.parse(fs.readFileSync(file,'utf8'));
  const dump=path.resolve('backups/neon/pre-category-seo.dump'),sha=hash(fs.readFileSync(dump));
  if(m.project!=='maconfeccoes'||m.branch!=='production'||m.hostname!=='ep-soft-tooth-b62ei5ko.c-2.sa-east-1.aws.neon.tech'||m.database!=='neondb'||m.schema!=='public'||m.dumpFile!=='backups/neon/pre-category-seo.dump'||m.sha256!==sha||!Number.isFinite(Date.parse(m.createdAt))||Date.now()-Date.parse(m.createdAt)<0||Date.now()-Date.parse(m.createdAt)>=86400000)throw Error();
  const base=path.resolve('.ma-neon-restore');fs.mkdirSync(base,{recursive:true});if(fs.realpathSync(base).toLowerCase()!==base.toLowerCase())throw Error();
  work=fs.mkdtempSync(path.join(base,'category-seo-'));const data=path.join(work,'data');
  const password=crypto.randomBytes(32).toString('hex');pwfile=path.join(work,'password.tmp');fs.writeFileSync(pwfile,password,{flag:'wx',mode:0o600});
  const port=await new Promise((resolve,reject)=>{const s=net.createServer();s.on('error',reject);s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));});});
  Object.assign(env,{PGHOST:'127.0.0.1',PGPORT:String(port),PGDATABASE:'postgres',PGUSER:'ma_seo_restore',PGPASSWORD:password,PGCONNECT_TIMEOUT:'5'});
  run('initdb',['-D',data,'-U','ma_seo_restore','--auth=scram-sha-256','--pwfile='+pwfile,'--encoding=UTF8','--locale=C']);fs.unlinkSync(pwfile);
  run('pg_ctl',['-D',data,'-l',path.join(work,'server.log'),'-o',`-h 127.0.0.1 -p ${port}`,'-w','start']);started=true;
  const sql=s=>run('psql',['-X','-A','-t','-v','ON_ERROR_STOP=1','-c',s]).trim();
  const actual=sql('SHOW data_directory');if(path.resolve(actual).toLowerCase()!==data.toLowerCase())throw Error();
  if(sql("SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind IN ('r','p','v','m','S','f')")!=='0')throw Error();
  const entries=run('pg_restore',['--list',dump]).split(/\r?\n/),schema=entries.filter(l=>/^\d+; 2615 \d+ SCHEMA - public /.test(l));if(schema.length!==1)throw Error();
  const list=path.join(work,'restore.list');fs.writeFileSync(list,entries.filter(l=>!schema.includes(l)).join('\n'));
  run('pg_restore',['--no-password','--exit-on-error','--no-owner','--no-acl','--use-list='+list,'--dbname=postgres',dump]);
  if(sql("SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'")!=='26')throw Error();
  if(sql("SELECT count(*) FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND t.typtype='e'")!=='5')throw Error();
  const history=sql('SELECT migration_name,checksum FROM public."_prisma_migrations" WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL ORDER BY migration_name').split(/\r?\n/);
  const baseline=JSON.parse(fs.readFileSync('prisma/neon-activation-plan.json','utf8'));
  if(JSON.stringify(history)!==JSON.stringify(baseline.migrations.map(x=>x.name+'|'+x.sha256)))throw Error();
  if(sql('SELECT count(*) FROM public."_prisma_migrations"')!=='3')throw Error();
  run('pg_ctl',['-D',data,'-m','fast','-w','stop']);started=false;
  m.restoreTest={isolated:true,passed:true,backupSha256:sha,verifiedAt:new Date().toISOString(),method:'new local PostgreSQL 18 SCRAM cluster; pg_restore exit-on-error; 26 tables, 5 enums, 3 migrations; stopped'};
  fs.writeFileSync(file,JSON.stringify(m,null,2)+'\n');console.log('ISOLATED_RESTORE_VALIDATED_MANIFEST_UPDATED');
 }finally{
  if(started)run('pg_ctl',['-D',path.join(work,'data'),'-m','fast','-w','stop']);
  if(pwfile&&fs.existsSync(pwfile))fs.unlinkSync(pwfile);env.PGPASSWORD='';
 }
})().catch(()=>{console.error('RESTORE_STOP_MANIFEST_NOT_APPROVED');process.exitCode=1;});
'@ | node
if ($LASTEXITCODE -ne 0) { throw 'Ensaio interrompido; não aplicar migration' }
```

Preservar dump original; somente a entrada duplicada CREATE SCHEMA public é excluída da lista TOC porque initdb já criou public. Não usar --clean/--create. Diretório de ensaio pode conter dados restaurados: proteger acesso e planejar descarte separado. A restauração não compara todos os registros byte a byte; pg_restore verifica importação e restrições, seguido de inventário e histórico.

## 4. Aplicação e verificação FUTURAS

Somente após nova autorização, backup/ensaio genuínos de menos de 24h e manifesto aceito:

```powershell
node scripts/production-category-seo.cjs --apply --backup-manifest backups/neon/pre-category-seo.manifest.json
```

Exige terminal interativo e frase digitada `AUTORIZO SEO maconfeccoes/neondb/public 0801c88c13c2`; não automatizar. Executor verifica novamente identidade, histórico inicial/checksums, ausência das duas colunas, integridade/idade do dump e vínculo do ensaio. Após aplicar, verifica quatro migrations concluídas com checksums corretos e SELECT das duas colunas com LIMIT 0. Não tentar reaplicar: o executor recusa histórico com quatro migrations.

## Riscos e recuperação

ALTER TABLE exige lock; transação aditiva não elimina risco de espera/timeout sob concorrência. Manifesto prova integridade/vínculo e registra ensaio, não é atestado assinado independente. Comandos novos deste documento foram preparados, não ensaiados nesta tarefa. Não usar manifesto de banco vazio.

Em falha, parar publicação e preservar evidências; não resetar, repetir deploy automaticamente, usar db push nem marcar migration manualmente. Backup não desfaz DDL por simples pg_restore sem limpeza. Recuperação preferencial: restaurar em novo destino isolado, validar e preparar troca autorizada de conexão; qualquer intervenção em produção exige plano específico. Não remover as colunas automaticamente. A aplicação SEO deve preceder a versão que passa a consultá-las.

## Execução autorizada — 16/10/2026

Backup real concluído às 13:10:56.808 UTC em backups/neon/pre-category-seo.dump (60.155 bytes), origem aprovada maconfeccoes/production/neondb/public via endpoint direct. Exclusivamente .env; pg_dump 18.6 custom com dados, histórico, sem owners/ACL, TLS verify-full/CA explícita/channel binding e sessão read-only. SHA-256: 623425a958ce14902eb17e4d3888d6c4317ff41591cf9f5d05aa98aece852276. Arquivo e manifesto ignorados pelo Git.

Restauração comprovada às 13:12:10.391 UTC em cluster local novo, SCRAM, loopback e porta temporária, com pg_restore --exit-on-error e sem --clean. Cluster encerrado antes do atestado. Comparação com inventário de origem antes/depois do dump: 26 tabelas (25 de aplicação), 5 enums, colunas/tipos/defaults/nullability, constraints e índices idênticos; histórico das três migrations e contagens por tabela idênticos. Apenas três registros no conjunto: histórico das migrations; não foram exibidos dados pessoais. Comparação de contagens é integridade básica, não comparação byte a byte de todos os valores.

Manifesto backups/neon/pre-category-seo.manifest.json aprovado pela função backup() do executor, sem chamar main/--apply. Válido até 17/10/2026 13:10:56.808 UTC (24h do backup); executor revalida no momento da aplicação. Nenhuma migration executada, nenhuma escrita Neon/R2 nem publicação.

Interrupções tratadas sem aprovar manifesto prematuramente: primeira checagem interpretou pg_stat_ssl do backend como TLS cliente; atrás do proxy Neon esse indicador não demonstra o TLS externo. Mantidos verify-full, CA e validação do hostname nos clientes libpq. Ensaios iniciais importaram o dump, mas comparação do histórico falhou devido a CRLF do psql Windows; parser corrigido acima, novo ensaio aprovado. Todos os clusters de ensaio foram encerrados. Scripts de execução e inventários privados permanecem em backups/neon, ignorados; clusters encerrados em .ma-neon-restore. Não remover nem reutilizar esses diretórios indiscriminadamente.

## Aplicação SEO autorizada — 16/10/2026

Executado exclusivamente production-category-seo.cjs --apply com manifesto acima e confirmação interativa fornecida pelo responsável. Executor retornou PRODUCTION_SEO_APPLIED_AND_VERIFIED, código 0. Pós-verificação independente somente leitura concluída às 13:20:45.638 UTC: Category.seoTitle e seoDescription são TEXT NOT NULL DEFAULT ''; quarta migration concluída, não revertida, checksum esperado. Permanecem 26 tabelas; estrutura anterior preservada, exceto as duas colunas e suas constraints NOT NULL esperadas no PostgreSQL 18. Contagens de todas as tabelas de aplicação iguais ao backup (sem registros de aplicação antes/depois); somente histórico recebe a quarta entrada. Nenhum lock não concedido observado na consulta final.

O comparador inicialmente sinalizou as duas constraints NOT NULL novas como diferença adicional; ajustado para reconhecê-las como parte prevista do SQL, sem nova execução de migration nem correção no banco. Evidência privada em backups/neon/category-seo-postcheck.json. Não reaplicar este executor: agora existem quatro migrations, e o preflight deve recusar nova aplicação. Banco preparado quanto ao SEO de categorias; build Linux e publicação continuam etapas separadas. Nenhuma alteração R2, build, merge, commit, push ou deploy nesta execução.
