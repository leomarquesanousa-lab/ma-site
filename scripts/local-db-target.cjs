'use strict';
const target = Object.freeze({ host: '127.0.0.1', port: '5432', database: 'ma_commerce_local', username: 'ma_commerce_dev', schema: 'public' });
function assertLocalDatabaseUrl(value) {
  const fail = () => { throw new Error('Destino bloqueado. Use npm run dev:local para o banco comercial local autorizado.'); };
  if (typeof value !== 'string' || !value) return fail();
  let url; try { url = new URL(value); } catch { return fail(); }
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || url.hostname !== target.host || url.port !== target.port || decodeURIComponent(url.pathname.slice(1)) !== target.database || decodeURIComponent(url.username) !== target.username || !url.password || url.hash) return fail();
  const keys = [...url.searchParams.keys()];
  if (keys.some(key => key !== 'schema') || url.searchParams.getAll('schema').length !== 1 || url.searchParams.get('schema') !== target.schema) return fail();
  return value;
}
module.exports = { target, assertLocalDatabaseUrl };
