'use strict';
// Install the single-file loader before Next loads environment in child workers.
if(process.env.MA_HOMOLOGATION!=='1')throw Error('Homologation preload requires explicit mode.');
require('./next-env.cjs').installNextEnv();
