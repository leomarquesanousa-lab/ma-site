'use strict';
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const {loadProjectEnv}=require('./project-env.cjs');
function installNextEnv(){
 const values=loadProjectEnv();
 // This pinned Next version calls the exported @next/env loader on startup/reload.
 // Replacing that loader supplies a single file, including forced reloads, without
 // changing node_modules, renaming files, or placing secrets in nextConfig.env.
 const moduleId=require.resolve('@next/env');
 const nextEnv=require(moduleId);
 nextEnv.processEnv([],root); // Initialize the framework snapshot without reading .env*.
 const loader=()=>{const parsed=loadProjectEnv();nextEnv.updateInitialEnv({...process.env});return{combinedEnv:process.env,parsedEnv:parsed,loadedEnvFiles:[{path:process.env.MA_HOMOLOGATION==='1'?'.env.homologacao':'.env',contents:'',env:parsed}]};};
 require.cache[moduleId].exports={...nextEnv,loadEnvConfig:loader,processEnv:()=>{const parsed=loadProjectEnv();return[process.env,parsed];}};
 nextEnv.updateInitialEnv({...process.env});
 return values;
}
module.exports={installNextEnv};
