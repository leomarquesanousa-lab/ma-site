// Read-only probe of the exact MA Confecções hostname supplied by the owner.
'use strict';
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript'),{PrismaClient}=require('@prisma/client');
const inspect=process.argv[3]==='--inspect-schema';
if(process.argv[2]!=='--run-confirmed-project'||process.argv.length!==(inspect?4:3)){console.error('Requires --run-confirmed-project, optionally --inspect-schema.');process.exit(1);}
const expectedHost='ep-soft-tooth-b62ei5ko-pooler.c-2.sa-east-1.aws.neon.tech';
const env=require('./project-env.cjs').loadProjectEnv();let raw;
try{raw=new URL(env.DATABASE_URL);}catch{console.error('Invalid DATABASE_URL. No connection attempted.');process.exit(1);}
if(raw.hostname!==expectedHost){console.error('Neon hostname mismatch. No connection attempted.');process.exit(1);}
console.log(JSON.stringify({envLoaded:true,source:'.env',hostnameMatches:true,oldDatabaseAccessed:false}));
const file=path.resolve(__dirname,'../lib/commerce/neon.ts'),m=new Module(file,module);m.filename=file;m.require=require;m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,file);
const url=new URL(m.exports.secureNeonUrl(raw.href));url.searchParams.set('connect_timeout','10');url.searchParams.set('socket_timeout','15');url.searchParams.set('connection_limit','1');
const client=new PrismaClient({datasources:{db:{url:url.href}},log:[]});
(async()=>{try{
 await client.$connect();
 if(!inspect){const one=await client.$queryRawUnsafe('SELECT 1 AS connection_test'),database=await client.$queryRawUnsafe('SELECT current_database() AS database_name');console.log(JSON.stringify({test:'NEON_PRISMA_READ_ONLY',connection:one[0]?.connection_test===1?'OK':'ERROR',database:database[0]?.database_name,tls:'REQUIRE_STRICT_TRUSTED_CA',writes:false}));return;}
 const identity=await client.$queryRawUnsafe('SELECT current_database() AS database, current_schema() AS schema, current_schemas(false) AS search_path_schemas');
 const schemas=await client.$queryRawUnsafe("SELECT nspname AS name FROM pg_catalog.pg_namespace WHERE nspname !~ '^pg_' AND nspname <> 'information_schema' ORDER BY nspname");
 const objects=await client.$queryRawUnsafe("SELECT n.nspname AS schema, c.relname AS name, c.relkind::text AS kind FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname !~ '^pg_' AND n.nspname <> 'information_schema' AND c.relkind IN ('r','p','f','v','m','S') ORDER BY n.nspname,c.relname");
 const types=await client.$queryRawUnsafe("SELECT n.nspname AS schema,t.typname AS name,t.typtype::text AS kind FROM pg_catalog.pg_type t JOIN pg_catalog.pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname !~ '^pg_' AND n.nspname <> 'information_schema' AND t.typtype IN ('e','d') ORDER BY n.nspname,t.typname");
 const routines=await client.$queryRawUnsafe("SELECT n.nspname AS schema,p.proname AS name FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname !~ '^pg_' AND n.nspname <> 'information_schema' ORDER BY n.nspname,p.proname");
 const expectedModels=[...fs.readFileSync(path.resolve(__dirname,'../prisma/schema.prisma'),'utf8').matchAll(/^model\s+(\w+)\s*\{/gm)].map(m=>m[1]);
 const unexpected=objects.filter(o=>!expectedModels.includes(o.name)&&o.name!=='_prisma_migrations');
 if(unexpected.length){console.log(JSON.stringify({inspection:'BLOCKED_UNRELATED_OBJECTS',identity:identity[0],schemas,objects,types,routines,writes:false}));process.exitCode=1;return;}
 const migrations=[];
 for(const table of objects.filter(o=>o.name==='_prisma_migrations'&&['r','p'].includes(o.kind))){const quote=s=>'"'+s.replaceAll('"','""')+'"';const records=await client.$queryRawUnsafe('SELECT migration_name,checksum,finished_at,rolled_back_at,applied_steps_count FROM '+quote(table.schema)+'."_prisma_migrations" ORDER BY started_at');migrations.push({schema:table.schema,records});}
 const localMigrations=fs.readdirSync(path.resolve(__dirname,'../prisma/migrations'),{withFileTypes:true}).filter(d=>d.isDirectory()).map(d=>d.name).sort();
 const applied=migrations.flatMap(m=>m.records.filter(r=>r.finished_at&&!r.rolled_back_at).map(r=>r.migration_name));
 console.log(JSON.stringify({inspection:'OK',connection:'OK',tls:'REQUIRE_STRICT_TRUSTED_CA',identity:identity[0],schemas,tableCount:objects.filter(o=>['r','p','f'].includes(o.kind)).length,objects,types,routines,migrations,pendingLocalMigrations:localMigrations.filter(n=>!applied.includes(n)),empty:objects.length===0&&types.length===0&&routines.length===0,applicationDataQueried:false,writes:false}));
 }catch(e){console.log(JSON.stringify({test:'NEON_READ_ONLY',connection:'ERROR',code:e.errorCode??e.code??e.name,windowsSecurityPackageError:String(e.message??'').includes('No credentials are available in the security package'),writes:false}));process.exitCode=1;}finally{await client.$disconnect().catch(()=>{});}})();
