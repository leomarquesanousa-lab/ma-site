'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { passwordPrompt } = require('./local-password.cjs');
const { target, assertLocalDatabaseUrl } = require('./local-db-target.cjs');
const root = path.resolve(__dirname, '..');
const resultPath = path.join(root, '.ma-local-init-result.json');
const names = ['202610130001_auth_baseline', '202610140001_commerce'];
const report = { status: 'PREPARING', phase: 'safety', migrationsApplied: [], applicationTables: null, totalTables: null, clientGenerated: false };
function publish() { fs.writeFileSync(resultPath, JSON.stringify(report, null, 2), { mode: 0o600 }); }
function stop(code) { const error = new Error(code); error.safeCode = code; throw error; }
function migrationPlan() {
  const dir = path.join(root, 'prisma/migrations');
  const actual = fs.readdirSync(dir, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name).sort();
  if (JSON.stringify(actual) !== JSON.stringify(names)) stop('MIGRATION_SEQUENCE_MISMATCH');
  if (!/provider\s*=\s*"postgresql"/.test(fs.readFileSync(path.join(dir, 'migration_lock.toml'), 'utf8'))) stop('PROVIDER_MISMATCH');
  return names.map(name => { const file = path.join(dir, name, 'migration.sql'), sql = fs.readFileSync(file, 'utf8');
    if (/^\s*(DROP|TRUNCATE|DELETE|INSERT|UPDATE|COPY|DO|CALL|GRANT|REVOKE)\b/im.test(sql) || /CREATE\s+(DATABASE|ROLE|USER)\b/i.test(sql.replace(/"User"/g, '"AuthUser"'))) stop('UNAPPROVED_SQL');
    return { name, hash: crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'), tables: [...sql.matchAll(/CREATE TABLE "([^"]+)"/g)].map(m => m[1]) };
  });
}
function psql(env, sql) {
  const childEnv = { ...env, PGHOSTADDR: target.host, PGCONNECT_TIMEOUT: '5', PGOPTIONS: '-c default_transaction_read_only=on' };
  const result = spawnSync('C:/Program Files/PostgreSQL/18/bin/psql.exe', ['-X', '-w', '-h', target.host, '-p', target.port, '-U', target.username, '-d', target.database, '-A', '-t', '-v', 'ON_ERROR_STOP=1', '-c', sql], { cwd: root, env: childEnv, encoding: 'utf8', timeout: 15000, windowsHide: true });
  if (result.error || result.status !== 0) stop('LOCAL_READ_FAILED');
  try { return JSON.parse(result.stdout.trim()); } catch { stop('LOCAL_RESULT_INVALID'); }
}
function identityValid(row) { return row.user === target.username && row.database === target.database && row.address === target.host && row.port === Number(target.port) && row.readOnly === 'on'; }
async function main() {
  publish();
  const config = JSON.parse(fs.readFileSync(path.join(root, '.ma-commerce.local.json'), 'utf8').replace(/^\uFEFF/, ''));
  if (!config || Object.keys(config).length !== Object.keys(target).length || Object.entries(target).some(([k,v]) => String(config[k]) !== v)) stop('LOCAL_CONFIG_MISMATCH');
  if (process.argv.length !== 2) stop('ARGUMENTS_NOT_ALLOWED');
  const plan = migrationPlan();
  if (plan[0].tables.join(',') !== 'User,Session' || plan[1].tables.length !== 22) stop('APPROVED_STRUCTURE_MISMATCH');
  report.status = 'WAITING_FOR_PASSWORD'; publish();
  console.log('Destino autorizado: 127.0.0.1:5432 / ma_commerce_local / ma_commerce_dev.');
  let password = await passwordPrompt();
  const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^PG|^PRISMA_/i.test(k)));
  env.DATABASE_URL = assertLocalDatabaseUrl(`postgresql://${target.username}:${encodeURIComponent(password)}@${target.host}:${target.port}/${target.database}?schema=${target.schema}`);
  env.PGPASSWORD = password; password = '';
  env.DIRECT_URL = ''; env.SHADOW_DATABASE_URL = ''; env.NODE_ENV = 'development';
  env.PRISMA_SCHEMA_ENGINE_BINARY = path.join(root, 'node_modules/@prisma/engines/schema-engine-windows.exe');
  env.PRISMA_QUERY_ENGINE_LIBRARY = path.join(root, 'node_modules/@prisma/engines/query_engine-windows.dll.node');
  try {
    report.status = 'RUNNING'; report.phase = 'preflight'; publish();
    const identitySql = `'user',current_user,'database',current_database(),'address',inet_server_addr(),'port',inet_server_port(),'readOnly',current_setting('transaction_read_only')`;
    const preflight = psql(env, `SELECT json_build_object(${identitySql},'connect',has_database_privilege(current_user,current_database(),'CONNECT'),'schemaExists',EXISTS(SELECT 1 FROM pg_namespace WHERE nspname='public'),'usage',CASE WHEN EXISTS(SELECT 1 FROM pg_namespace WHERE nspname='public') THEN has_schema_privilege(current_user,'public','USAGE') ELSE false END,'create',CASE WHEN EXISTS(SELECT 1 FROM pg_namespace WHERE nspname='public') THEN has_schema_privilege(current_user,'public','CREATE') ELSE false END,'relations',(SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public'),'types',(SELECT count(*) FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public'),'routines',(SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public'));`);
    if (!identityValid(preflight)) stop('SERVER_IDENTITY_MISMATCH');
    if (!preflight.connect || !preflight.schemaExists || !preflight.usage || !preflight.create) stop('INSUFFICIENT_LOCAL_PRIVILEGES');
    if (preflight.relations !== 0 || preflight.types !== 0 || preflight.routines !== 0) stop('PUBLIC_NOT_EMPTY_OR_HISTORY_EXISTS');
    const finalPlan = migrationPlan();
    if (JSON.stringify(finalPlan) !== JSON.stringify(plan)) stop('MIGRATION_CHANGED_AFTER_REVIEW');
    assertLocalDatabaseUrl(env.DATABASE_URL);
    console.log('Identidade local, permissões e schema vazio confirmados. Aplicando as duas migrations aprovadas.');
    report.phase = 'migrate_deploy'; report.approvedHashes = plan.map(p => ({ name: p.name, hash: p.hash })); publish();
    const applied = spawnSync(process.execPath, [path.join(root, 'node_modules/prisma/build/index.js'), 'migrate', 'deploy', '--config', path.join(root, 'prisma.config.ts')], { cwd: root, env, encoding: 'utf8', timeout: 120000, windowsHide: true });
    if (applied.error || applied.status !== 0) { report.prismaCode = ((applied.stderr ?? '') + (applied.stdout ?? '')).match(/\bP\d{4}\b/)?.[0] ?? null; stop('MIGRATION_FAILED_NO_RETRY'); }
    report.phase = 'postflight'; publish();
    const postflight = psql(env, `SELECT json_build_object(${identitySql},'tables',(SELECT json_agg(tablename ORDER BY tablename) FROM pg_tables WHERE schemaname='public'),'history',(SELECT json_agg(json_build_object('name',migration_name,'checksum',checksum,'finished',finished_at IS NOT NULL,'rolledBack',rolled_back_at IS NOT NULL) ORDER BY migration_name) FROM public._prisma_migrations));`);
    if (!identityValid(postflight)) stop('POSTFLIGHT_IDENTITY_MISMATCH');
    const expectedTables = [...plan.flatMap(p => p.tables), '_prisma_migrations'].sort();
    if (JSON.stringify([...(postflight.tables ?? [])].sort()) !== JSON.stringify(expectedTables)) stop('POSTFLIGHT_TABLES_MISMATCH');
    if (!Array.isArray(postflight.history) || postflight.history.length !== 2 || postflight.history.some((h,i) => h.name !== plan[i].name || h.checksum !== plan[i].hash || !h.finished || h.rolledBack)) stop('POSTFLIGHT_HISTORY_MISMATCH');
    report.migrationsApplied = names; report.applicationTables = 24; report.totalTables = 25;
    report.phase = 'generate'; publish();
    const generated = spawnSync(process.execPath, [path.join(root, 'scripts/check-commerce-schema.cjs'), 'generate'], { cwd: root, env, encoding: 'utf8', timeout: 120000, windowsHide: true });
    if (generated.error || generated.status !== 0) { report.generationError = /EPERM/.test((generated.stderr ?? '') + (generated.stdout ?? '')) ? 'EPERM' : 'GENERATE_FAILED'; stop('CLIENT_GENERATION_FAILED'); }
    report.clientGenerated = true; report.status = 'COMPLETE'; report.phase = 'complete'; publish();
    console.log('Concluído: 2 migrations, 24 tabelas da aplicação + histórico Prisma. Cliente gerado. Nenhum usuário administrativo criado.');
  } finally { env.PGPASSWORD = ''; env.DATABASE_URL = ''; }
}
main().catch(error => { report.status = 'STOPPED'; report.error = error.safeCode ?? 'LOCAL_INITIALIZATION_STOPPED'; publish(); console.error('Operação interrompida:', report.error); process.exitCode = 1; });
