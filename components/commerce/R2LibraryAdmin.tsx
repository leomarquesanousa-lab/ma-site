"use client";
import {useEffect,useState} from 'react';
import type {FolderMapping,LibraryReport} from '@/lib/commerce/r2-library';
import type {Art} from './ArtworkAdmin';
import styles from '@/app/commerce.module.css';
import galleryStyles from './R2LibraryAdmin.module.css';
export default function R2LibraryAdmin({onSynced,onEdit,refreshKey=0}:{onSynced:()=>void;onEdit:(art:Art)=>void;refreshKey?:number}){
 const [report,setReport]=useState<LibraryReport|null>(null),[mapping,setMapping]=useState<FolderMapping[]>([]),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[page,setPage]=useState(0),[query,setQuery]=useState(''),[images,setImages]=useState<{items:Art[];total:number;hasMore:boolean}|null>(null),[reload,setReload]=useState(0);
 const [loadingImages,setLoadingImages]=useState(true),[imagesError,setImagesError]=useState('');
 const [operationError,setOperationError]=useState('');
 async function load(refresh=false){setBusy(true);try{const r=await fetch('/api/art-library?admin=1'+(refresh?'&refresh=1':''),{cache:'no-store'}),v=await r.json();if(!r.ok)throw Error(v.error);setReport(v);setMapping(v.mapping);}catch(e){setMessage(e instanceof Error?e.message:'Falha na leitura.');}finally{setBusy(false);}}
 useEffect(()=>{void load();},[]);
 useEffect(()=>{
  const abort=new AbortController();setLoadingImages(true);setImagesError('');
  const timer=setTimeout(async()=>{try{
   const r=await fetch('/api/art-library?admin=1&images=1&'+new URLSearchParams({page:String(page),q:query}),{cache:'no-store',signal:abort.signal}),v=await r.json();
   if(!r.ok)throw Error(v.error);
   if(!Array.isArray(v.items)||!Number.isSafeInteger(v.total)||v.total<0)throw Error('Resposta inválida ao carregar as imagens.');
   if(!abort.signal.aborted){if(page>0&&page*24>=v.total){setPage(Math.max(0,Math.ceil(v.total/24)-1));return;}setImages(v);}
  }catch(e){if(!abort.signal.aborted)setImagesError(e instanceof Error?e.message:'Falha na leitura.');}
  finally{if(!abort.signal.aborted)setLoadingImages(false);}},200);
  return()=>{clearTimeout(timer);abort.abort();};
 },[page,query,reload,refreshKey]);
 function change(prefix:string,patch:Partial<FolderMapping>){setMapping(current=>[...current.filter(m=>m.prefix!==prefix),{...(current.find(m=>m.prefix===prefix)??{prefix,types:[]}),...patch}]);}
 async function submit(action:'sync'|'configure'){
  if(action==='configure'&&!confirm('Aplicar esta configuração às imagens das categorias? As edições individuais anteriores serão substituídas.'))return;
  setBusy(true);setOperationError('');setMessage(action==='sync'?'Importando referências, sem publicar imagens…':'Salvando configuração…');
  try{
   const r=await fetch('/api/art-library',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,mapping})});
   let v;try{v=await r.json();}catch{throw Error(`A API respondeu HTTP ${r.status} sem uma resposta JSON válida. Confira os logs da hospedagem.`);}
   if(!r.ok)throw Error(`${v.error||'Falha na operação.'} (HTTP ${r.status}${v.code?`, ${v.code}`:''})`);
   if(action==='sync')setReport(v);setMessage(action==='sync'?'Referências importadas. Novas imagens permanecem inativas. Nenhum arquivo foi alterado no R2.':`${v.published} imagens liberadas conforme os direitos confirmados.`);setReload(x=>x+1);onSynced();
  }catch(e){setMessage('');setOperationError(e instanceof Error?e.message:'Falha na operação.');}finally{setBusy(false);}
 }
 return <section className={`${styles.panel} ${galleryStyles.root}`} aria-label="Galeria R2"><h3>Galeria R2 · categorias, direitos e sincronização</h3><p>Esta listagem administrativa inclui imagens inativas e com direitos pendentes. Somente a galeria do cliente aplica o bloqueio comercial.</p><p>Originais protegidos; acesso remoto somente leitura. Novas imagens são importadas inativas, aguardando configuração e direitos comerciais.</p><div className={styles.actions}><button type="button" disabled={busy} onClick={()=>void load(true)}>Consultar pastas</button><button type="button" disabled={busy} onClick={()=>void submit('sync')}>{busy?'Aguarde…':'Sincronizar artes'}</button></div>
 {operationError&&<p role="alert" className={styles.error}>{operationError}</p>}
 {report&&<><p>{report.objects} objetos encontrados · {images?.total??report.indexed} imagens no catálogo · {report.ignored.length} arquivos ignorados</p><details><summary>Configurar categorias e produtos</summary><fieldset disabled={busy}><legend>Compatibilidade e direitos por pasta</legend><p>Uma pasta pode atender vários produtos. Pastas mais específicas têm prioridade. Ativar exige origem, licença e autorização confirmadas.</p>{report.prefixes.map(prefix=>{const m=mapping.find(m=>m.prefix===prefix);return <details key={prefix}><summary style={{overflowWrap:'anywhere'}}>{prefix.replace(/^artes\//,'').replace(/\/$/,'').replaceAll('/',' → ')} · {m?.active?'ativa':'inativa'}</summary><div className={styles.filters}><label><input type="checkbox" checked={m?.active??false} onChange={e=>change(prefix,{active:e.target.checked})}/>Categoria ativa</label>{[['MUG','Canecas'],['SHIRT','Camisetas'],['PILLOW','Almofadas'],['TILE','Azulejos']].map(([value,label])=><label key={value}><input type="checkbox" checked={m?.types.includes(value)??false} onChange={e=>change(prefix,{types:e.target.checked?[...(m?.types??[]),value]:(m?.types??[]).filter(t=>t!==value)})}/>{label}</label>)}<label>Origem / autoria<input maxLength={500} value={m?.origin??''} onChange={e=>change(prefix,{origin:e.target.value})}/></label><label>Licença e condições de uso<textarea maxLength={2000} value={m?.license??''} onChange={e=>change(prefix,{license:e.target.value})}/></label><label><input type="checkbox" checked={m?.authorized??false} onChange={e=>change(prefix,{authorized:e.target.checked})}/>Confirmo a autorização de uso comercial</label></div></details>;})}</fieldset><button type="button" disabled={busy} onClick={()=>void submit('configure')}>Salvar configuração das categorias</button></details>
 <details><summary>Hierarquia reconhecida</summary><ul>{report.categories.map(c=><li key={c.path}>{c.path} · {c.count}</li>)}</ul></details><details><summary>Arquivos ignorados / pastas vazias</summary><ul>{[...report.ignored,...report.empty].slice(0,200).map(k=><li key={k}>{k}</li>)}</ul></details></>}
 <label>Buscar imagem no catálogo<input value={query} onChange={e=>{setQuery(e.target.value);setPage(0);}}/></label>
 {loadingImages&&<p role="status">Carregando imagens do catálogo administrativo…</p>}
 {imagesError&&<p role="alert">{imagesError} <button type="button" onClick={()=>setReload(n=>n+1)}>Tentar novamente</button></p>}
 {!loadingImages&&!imagesError&&images&&<><p role="status">{images.total} imagens encontradas, incluindo inativas e bloqueadas. Clique na imagem para abrir os detalhes e editar.</p><div className={galleryStyles.grid}>{images.items.map(art=><button className={galleryStyles.card} type="button" key={art.id} aria-label={`Ver detalhes de ${art.name}`} onClick={()=>onEdit(art)}><img loading="lazy" src={'/api/arquivos/'+art.thumbnailAssetId} alt=""/><span className={galleryStyles.name} title={art.name}>{art.name}</span><small className={galleryStyles.category} title={[art.category,art.subcategory].filter(Boolean).join(' / ')}>{[art.category,art.subcategory].filter(Boolean).join(' / ')}</small></button>)}</div>
 {images.total===0&&<p>{query?'Nenhuma imagem corresponde à busca.':'Nenhuma imagem importada neste banco.'}{query&&<button type="button" onClick={()=>{setQuery('');setPage(0);}}>Limpar busca</button>}</p>}
 <div className={styles.actions}><button type="button" disabled={page===0||busy} onClick={()=>setPage(p=>p-1)}>Anterior</button><small>Página {page+1} · {images.total} imagens</small><button type="button" disabled={!images.hasMore||busy} onClick={()=>setPage(p=>p+1)}>Próxima</button></div></>}
 <p role="status">{message}</p></section>;
}
