'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {readProjectEnv}=require('./project-env.cjs');
const root=path.resolve(__dirname,'..');
const pooledHost='ep-soft-tooth-b62ei5ko-pooler.c-2.sa-east-1.aws.neon.tech';
const directHost='ep-soft-tooth-b62ei5ko.c-2.sa-east-1.aws.neon.tech';
const names=['202610130001_auth_baseline','202610140001_commerce','202610150001_studio'];
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
function fail(message){const error=new Error(message);error.safeCode=message;throw error;}
function prepare(){
 const values=readProjectEnv();let source;try{source=new URL(values.DATABASE_URL);}catch{fail('DATABASE_URL inválida.');}
 if(!['postgres:','postgresql:'].includes(source.protocol)||source.hostname!==pooledHost||source.pathname!=='/neondb'||!source.username||!source.password||(source.port&&source.port!=='5432')||source.hash)fail('Destino divergente do projeto maconfeccoes aprovado.');
 if([...source.searchParams.keys()].some(k=>!['sslmode','sslaccept','sslcert','schema','channel_binding','connect_timeout','socket_timeout','pool_timeout','connection_limit','pgbouncer'].includes(k)))fail('Parâmetro de conexão não revisado.');
 if(source.searchParams.has('schema')&&source.searchParams.get('schema')!=='public')fail('Schema divergente.');
 const plan=JSON.parse(fs.readFileSync(path.join(root,'prisma/neon-activation-plan.json'),'utf8'));
 if(plan.version!==1||plan.project!=='maconfeccoes'||plan.pooledHostname!==pooledHost||plan.directHostname!==directHost||plan.database!=='neondb'||plan.schema!=='public'||JSON.stringify(plan.migrations.map(m=>m.name))!==JSON.stringify(names))fail('Manifesto de migrations inválido.');
 const actual=fs.readdirSync(path.join(root,'prisma/migrations'),{withFileTypes:true}).filter(d=>d.isDirectory()).map(d=>d.name).sort();if(JSON.stringify(actual)!==JSON.stringify(names))fail('Cadeia de migrations mudou; revisão necessária.');
 if(!/provider\s*=\s*"postgresql"/.test(fs.readFileSync(path.join(root,'prisma/migrations/migration_lock.toml'),'utf8')))fail('Provider divergente.');
 const schema=fs.readFileSync(path.join(root,'prisma/schema.prisma')),ca=fs.readFileSync(path.join(root,'prisma/certs/neon-root-ca.pem'));
 if(hash(schema)!==plan.schemaSha256||hash(ca)!==plan.caSha256)fail('Schema ou CA mudou após a revisão.');
 const migrations=plan.migrations.map(m=>{const bytes=fs.readFileSync(path.join(root,'prisma/migrations',m.name,'migration.sql'));if(hash(bytes)!==m.sha256)fail('Migration mudou após a revisão.');const sql=bytes.toString('utf8').replace(/--[^\r\n]*/g,'');for(const statement of sql.split(';').map(s=>s.trim()).filter(Boolean))if(!/^(CREATE TYPE "\w+" AS ENUM|CREATE TABLE "\w+"\s*\(|CREATE (?:UNIQUE )?INDEX "\w+" ON|ALTER TABLE "\w+" ADD (?:COLUMN|CONSTRAINT))/.test(statement))fail('Operação SQL não aprovada.');if(/\b(DROP|TRUNCATE|DELETE|UPDATE|INSERT|COPY|CALL|GRANT|REVOKE)\b/.test(sql.replace(/ON DELETE (?:CASCADE|RESTRICT)/g,'').replace(/ON UPDATE CASCADE/g,'')))fail('Comando destrutivo/DML recusado.');return{...m,bytes};});
 const url=new URL(source.href);url.hostname=directHost;url.searchParams.delete('pgbouncer');url.searchParams.delete('channel_binding');url.searchParams.set('schema','public');url.searchParams.set('sslmode','require');url.searchParams.set('sslaccept','strict');url.searchParams.set('sslcert',path.join(root,'prisma/certs/neon-root-ca.pem'));url.searchParams.set('connection_limit','1');url.searchParams.set('connect_timeout','10');url.searchParams.set('socket_timeout','15');
 return{root,plan,planHash:hash(JSON.stringify(plan)),url:url.href,schema,ca,migrations};
}
async function emptyInventory(db){const identity=await db.$queryRawUnsafe("SELECT current_database() AS database,current_schema() AS schema,has_schema_privilege('public','USAGE') AS schema_usage,has_schema_privilege('public','CREATE') AS schema_create");if(identity[0]?.database!=='neondb'||identity[0]?.schema!=='public')fail('DATABASE_IDENTITY_MISMATCH');if(!identity[0]?.schema_usage||!identity[0]?.schema_create)fail('SCHEMA_PRIVILEGES_MISSING');const rows=await db.$queryRawUnsafe("SELECT n.nspname AS schema,c.relname AS name FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname !~ '^pg_' AND n.nspname <> 'information_schema' AND c.relkind IN ('r','p','f','v','m','S') UNION ALL SELECT n.nspname,t.typname FROM pg_catalog.pg_type t JOIN pg_catalog.pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname !~ '^pg_' AND n.nspname <> 'information_schema' AND t.typtype IN ('e','d') UNION ALL SELECT n.nspname,p.proname FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname !~ '^pg_' AND n.nspname <> 'information_schema'");if(rows.length)fail('DATABASE_NOT_EMPTY_STOP_NO_RETRY');}
module.exports={prepare,hash,root,pooledHost,directHost,names,emptyInventory};
