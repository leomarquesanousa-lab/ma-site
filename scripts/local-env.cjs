'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { parseEnv } = require('node:util');
const { assertLocalDatabaseUrl } = require('./local-db-target.cjs');

function loadLocalDatabaseUrl() {
  let values;
  try {
    values = parseEnv(fs.readFileSync(path.resolve(__dirname, '../.env.local'), 'utf8').replace(/^\uFEFF/, ''));
  } catch {
    throw new Error('Configure DATABASE_URL em .env.local privado, conforme docs/LOCAL_ENV.md. Nenhuma conexão foi iniciada.');
  }
  if (!values.DATABASE_URL) throw new Error('DATABASE_URL ausente em .env.local. Consulte docs/LOCAL_ENV.md.');
  // No fallback to .env, inherited credentials or variable expansion.
  return assertLocalDatabaseUrl(values.DATABASE_URL);
}
module.exports = { loadLocalDatabaseUrl };
