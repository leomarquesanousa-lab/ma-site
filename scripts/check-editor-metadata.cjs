'use strict';
// Offline event tests of the actual form. No database, HTTP or uploads.
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),assert=require('node:assert/strict');
function compile(file,extra=''){const result=ts.transpileModule(fs.readFileSync(file,'utf8')+extra,{reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}});assert.equal(result.diagnostics?.length??0,0);return result.outputText;}
const metadata={};vm.runInNewContext(compile('lib/commerce/editor-metadata.ts'),{exports:metadata});
assert.equal(metadata.automaticSlug(' Can\u00e9ca -- Futebol! '),'caneca-futebol');
assert.equal(metadata.publicMetadata({name:'Example',seoTitle:'Manual title',seoDescription:'Manual description'}).title.absolute,'Manual title');
assert.equal(metadata.metadataSuggestions({name:'Example'}).seoDescription,'Example');
assert.ok(metadata.metadataSuggestions({name:'x',description:'word '.repeat(100)}).seoDescription.length<=160);
const source=compile('components/commerce/AdminWorkspace.tsx','\nexport { RecordForm };');
for(const endpoint of ['categories','products']){
 let slots=[],cursor=0;const hooks={useState(initial){const i=cursor++;if(!(i in slots))slots[i]=initial;return[slots[i],value=>slots[i]=typeof value==='function'?value(slots[i]):value];},useRef(initial){const i=cursor++;if(!(i in slots))slots[i]={current:initial};return slots[i];},useEffect(){}};
 const exports={};vm.runInNewContext(source,{exports,require:id=>id==='react'?hooks:id==='react/jsx-runtime'?require(id):id.includes('editor-metadata')?metadata:id.includes('ProductCompositionFields')?{editableVariants:()=>[],editableTemplates:()=>[]}:id.includes('/currency')?{centsToReais:()=>''}:{},Set});
 const fields=['name','slug','description','seoTitle','seoDescription'].map(key=>({key,label:key,type:key==='description'||key==='seoDescription'?'textarea':'text'}));
 let initial={};function render(){cursor=0;return exports.RecordForm({title:'Test',fields,initial,endpoint,done(){}});}
 function find(node,label){if(!node)return;if(Array.isArray(node)){for(const child of node){const found=find(child,label);if(found)return found;}}else if(typeof node==='object'){if(node.props?.['aria-label']===label)return node;return find(node.props?.children,label);}}
 function input(label,value){const node=find(render(),label);assert.ok(node,label);node.props.onChange({target:{value}});}
 function value(label){return find(render(),label).props.value;}
 input('name','Caneca Futebol');assert.equal(value('slug'),'caneca-futebol');assert.equal(value('seoTitle'),'Caneca Futebol | MA Confec\u00e7\u00f5es');
 input('description','Descricao factual.');assert.equal(value('seoDescription'),'Descricao factual.');
 input('slug','manual');input('seoTitle','My title');input('seoDescription','My description');input('name','Another name');input('description','Changed description');
 assert.equal(value('slug'),'manual');assert.equal(value('seoTitle'),'My title');assert.equal(value('seoDescription'),'My description');
 initial={id:'saved-fixture',name:'Saved',slug:'saved-slug',seoTitle:'Saved title',seoDescription:'Saved description'};slots=[];
 input('name','Renamed');assert.equal(value('slug'),'saved-slug');assert.equal(value('seoTitle'),'Saved title');assert.equal(value('seoDescription'),'Saved description');
}
for(const f of ['lib/commerce/admin.ts','lib/commerce/category-seo.ts','app/colecoes/[...segmentos]/page.tsx','app/produtos/[slug]/page.tsx','app/api/commerce/[...path]/route.ts'])compile(f);
console.log('PASS: actual form change handlers for products/categories, automatic metadata, manual locks, existing values, public metadata and targeted syntax. Offline harness; not a visual browser test.');
