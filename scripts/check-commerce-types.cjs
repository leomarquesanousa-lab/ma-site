// Lightweight static check of the commerce implementation. No code emission or database access.
const fs=require('node:fs');
const ts=require('typescript');
const config=ts.readConfigFile('tsconfig.json',ts.sys.readFile);
if(config.error)throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText,' '));
const parsed=ts.parseJsonConfigFileContent(config.config,ts.sys,'.');
const files=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=dir+'/'+entry.name;if(entry.isDirectory())walk(file);else if(/\.tsx?$/.test(file))files.push(file);}}
for(const dir of ['lib/commerce','components/commerce','app/admin','app/catalogo','app/produtos','app/carrinho','app/api/commerce','app/api/uploads','app/api/arquivos','app/colecoes'])walk(dir);
files.push('app/page.tsx','components/SiteHeader.tsx','app/minha-conta/enderecos/page.tsx','app/minha-conta/pedidos/page.tsx','app/api/cadastro/route.ts');
const program=ts.createProgram(files,{...parsed.options,incremental:false,noEmit:true});
const diagnostics=ts.getPreEmitDiagnostics(program);
for(const diagnostic of diagnostics){const p=diagnostic.file&&diagnostic.start!==undefined?diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start):null;console.log((diagnostic.file?.fileName??'')+(p?':'+(p.line+1):''),ts.flattenDiagnosticMessageText(diagnostic.messageText,' '));}
for(const file of ['app/commerce.module.css','app/premium.module.css'])require('postcss').parse(fs.readFileSync(file,'utf8'));
console.log('Commerce type/CSS diagnostics:',diagnostics.length);
process.exitCode=diagnostics.length?1:0;
