'use strict';
const {loadProjectEnv}=require('./project-env.cjs');
const {assertLocalDatabaseUrl}=require('./local-db-target.cjs');
function loadLocalDatabaseUrl(){return assertLocalDatabaseUrl(loadProjectEnv().DATABASE_URL);}
module.exports={loadLocalDatabaseUrl};
