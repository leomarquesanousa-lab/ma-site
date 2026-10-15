const { spawnSync } = require('node:child_process');
const path = require('node:path');
const command=process.argv[2]??'validate';
if(!['validate','generate'].includes(command))throw new Error('Only offline validate or generate are supported.');
const result=spawnSync(process.execPath,['node_modules/prisma/build/index.js',command,'--config','prisma/offline.config.ts'],{
  stdio:'inherit',
  env:{...process.env,DATABASE_URL:'postgresql://offline:offline@127.0.0.1:1/offline',PRISMA_SCHEMA_ENGINE_BINARY:path.resolve('node_modules/@prisma/engines/schema-engine-windows.exe'),PRISMA_QUERY_ENGINE_LIBRARY:path.resolve('node_modules/@prisma/engines/query_engine-windows.dll.node')},
});
if(result.error)console.error(result.error.message);
process.exitCode=result.status??1;
