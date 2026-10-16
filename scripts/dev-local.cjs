'use strict';
// Compatibility entrypoint. Configuration now comes exclusively from .env.
if(process.argv.length!==2){console.error('Este iniciador não aceita comandos alternativos.');process.exitCode=1;}
else{process.argv=[process.execPath,__filename,'dev','--hostname','127.0.0.1','--port','3001'];require('./run-next.cjs');}
