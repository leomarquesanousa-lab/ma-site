'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { loadLocalDatabaseUrl } = require('./local-env.cjs');
const { spawn } = require('node:child_process');
const { target, assertLocalDatabaseUrl } = require('./local-db-target.cjs');
const root = path.resolve(__dirname, '..');
async function main() {
  let config; try { config = JSON.parse(fs.readFileSync(path.join(root, '.ma-commerce.local.json'), 'utf8').replace(/^\uFEFF/, '')); } catch { throw new Error('Configuração local ausente ou inválida: .ma-commerce.local.json.'); }
  if (!config || typeof config !== 'object' || Array.isArray(config) || Object.keys(config).length !== Object.keys(target).length || Object.entries(target).some(([key, value]) => String(config[key]) !== value)) throw new Error('Configuração recusada: somente o destino local autorizado é permitido. Não inclua senha no JSON.');
  if (process.argv.length !== 2) throw new Error('Este iniciador não aceita comandos ou destinos alternativos.');
  let databaseUrl = assertLocalDatabaseUrl(loadLocalDatabaseUrl());
  const env = { ...process.env, NODE_ENV: 'development', DATABASE_URL: databaseUrl, DIRECT_URL: '', SHADOW_DATABASE_URL: '', NEXT_PUBLIC_SITE_URL: 'http://127.0.0.1:3001' };
  // Empty values prevent Next.js from inheriting SMTP credentials from the original .env.
  for (const prefix of ['SMTP', 'EMAIL']) for (const key of ['HOST', 'PORT', 'USER', 'PASS', 'FROM']) env[`${prefix}_${key}`] = '';
  console.log('Destino validado: PostgreSQL local 127.0.0.1:5432 / ma_commerce_local.');
  const child = spawn(process.execPath, [path.join(root, 'node_modules/next/dist/bin/next'), 'dev', '--hostname', '127.0.0.1', '--port', '3001'], { cwd: root, stdio: 'inherit', env });
  // Pass credentials to the child only in memory, never command arguments or logs.
  env.DATABASE_URL = ''; databaseUrl = '';
  child.once('error', () => { console.error('Não foi possível iniciar o ambiente local.'); process.exitCode = 1; });
  child.once('exit', code => { process.exitCode = code ?? 1; });
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
