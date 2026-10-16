"use client";
import { useEffect, useRef, useState } from "react";
import { commerceRequest, moneyLabel } from "./client";
import AdminListLayout, { type AdminColumn } from "./AdminListLayout";
import styles from "./CustomersWorkspace.module.css";
type Customer={id:string;name:string|null;email:string;createdAt:string;_count:{orders:number;quotes:number}};
type Page={items:Customer[];total:number;page:number;pages:number;pageSize:number};
type Detail=Customer&{orders:{id:string;createdAt:string;status:string;totalCents:number}[];quotes:{id:string;createdAt:string;status:string}[]};
const date=(value:string)=>new Date(value).toLocaleDateString('pt-BR');
const columns:AdminColumn<Customer>[]=[{key:'name',label:'Nome',render:c=>c.name||'Nome não informado'},{key:'email',label:'E-mail',render:c=>c.email},{key:'createdAt',label:'Cadastro',render:c=>date(c.createdAt)},{key:'orders',label:'Pedidos',render:c=>c._count.orders}];
export default function CustomersWorkspace(){
 const [view,setView]=useState<'list'|'grid'>('list'),[search,setSearch]=useState(''),[q,setQ]=useState(''),[sort,setSort]=useState('newest'),[orders,setOrders]=useState('all'),[page,setPage]=useState(1),[data,setData]=useState<Page|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState('');
 const [selected,setSelected]=useState<Customer|null>(null),[detail,setDetail]=useState<Detail|null>(null),[detailBusy,setDetailBusy]=useState(false),[detailError,setDetailError]=useState('');
 const panel=useRef<HTMLElement>(null),returnFocus=useRef<HTMLElement|null>(null);
 useEffect(()=>{try{const saved=sessionStorage.getItem('ma.admin.customers.view');if(saved==='grid'||saved==='list')setView(saved);}catch{}},[]);
 useEffect(()=>{const timer=setTimeout(()=>{setQ(search.trim());setPage(1);},250);return()=>clearTimeout(timer);},[search]);
 useEffect(()=>{let live=true;setLoading(true);setError('');const params=new URLSearchParams({paginated:'1',q,sort,orders,page:String(page)});commerceRequest<Page>(`admin/customers?${params}`).then(result=>{if(!Array.isArray(result.items)||!Number.isInteger(result.total))throw Error('Resposta inválida na listagem de clientes.');if(live)setData(result);}).catch(e=>{if(live){setError(e.message);setData(null);}}).finally(()=>{if(live)setLoading(false);});return()=>{live=false;};},[q,sort,orders,page]);
 useEffect(()=>{if(!selected)return;let live=true;setDetail(null);setDetailError('');setDetailBusy(true);panel.current?.focus();commerceRequest<Detail>(`admin/customers?id=${encodeURIComponent(selected.id)}`).then(result=>{if(!result||!Array.isArray(result.orders)||!Array.isArray(result.quotes))throw Error('Resposta inválida nos detalhes do cliente.');if(live)setDetail(result);}).catch(e=>{if(live)setDetailError(e.message);}).finally(()=>{if(live)setDetailBusy(false);});return()=>{live=false;};},[selected]);
 function chooseView(next:'list'|'grid'){setView(next);try{sessionStorage.setItem('ma.admin.customers.view',next);}catch{}}
 function close(){setSelected(null);returnFocus.current?.focus();}
 return <section className={styles.workspace} aria-label="Clientes cadastrados"><div className={styles.toolbar}>
  <label className={styles.search}>Buscar cliente<input type="search" maxLength={180} value={search} placeholder="Nome ou e-mail" onChange={e=>setSearch(e.target.value)}/></label>
  <label>Pedidos<select value={orders} onChange={e=>{setOrders(e.target.value);setPage(1);}}><option value="all">Todos</option><option value="with">Com pedidos</option><option value="without">Sem pedidos</option></select></label>
  <label>Ordenar<select value={sort} onChange={e=>{setSort(e.target.value);setPage(1);}}><option value="newest">Cadastro mais recente</option><option value="oldest">Cadastro mais antigo</option><option value="nameAsc">Nome A–Z</option><option value="nameDesc">Nome Z–A</option></select></label>
  <div className={styles.modes} role="group" aria-label="Modo de visualização"><button type="button" aria-pressed={view==='list'} onClick={()=>chooseView('list')}>☰ Lista</button><button type="button" aria-pressed={view==='grid'} onClick={()=>chooseView('grid')}>▦ Grade</button></div>
 </div><p className={styles.count} role="status">{loading?'Carregando clientes…':data?`${data.total} resultado${data.total===1?'':'s'} · página ${data.page} de ${data.pages}`:''}</p>
 {error&&<p role="alert" className={styles.error}>{error}</p>}
 <div className={`${styles.content} ${selected?styles.withDetail:''}`}><div className={styles.results} aria-busy={loading}>
  {!loading&&data&&<><AdminListLayout rows={data.items} selectedId={selected?.id} columns={columns} view={view} label="Clientes" onDetails={row=>{returnFocus.current=document.activeElement as HTMLElement;setSelected(row);}}/><nav className={styles.pagination} aria-label="Páginas de clientes"><button type="button" disabled={data.page<=1} onClick={()=>setPage(data.page-1)}>Anterior</button><span>{data.page} / {data.pages}</span><button type="button" disabled={data.page>=data.pages} onClick={()=>setPage(data.page+1)}>Próxima</button></nav></>}
 </div>{selected&&<aside ref={panel} tabIndex={-1} className={styles.detail} aria-label="Detalhes do cliente" onKeyDown={e=>{if(e.key==='Escape')close();}}><header><h3>{selected.name||'Cliente'}</h3><button type="button" aria-label="Fechar detalhes" onClick={close}>Fechar ×</button></header>
  {detailBusy&&<p role="status">Carregando detalhes…</p>}{detailError&&<p role="alert" className={styles.error}>{detailError}</p>}
  {detail&&<><dl><dt>E-mail</dt><dd>{detail.email}</dd><dt>Cadastro</dt><dd>{date(detail.createdAt)}</dd><dt>Pedidos</dt><dd>{detail._count.orders}</dd><dt>Orçamentos</dt><dd>{detail._count.quotes}</dd></dl><h4>Pedidos recentes</h4>{detail.orders.length?<ul>{detail.orders.map(order=><li key={order.id}><strong>#{order.id.slice(-8)}</strong><span>{date(order.createdAt)} · {order.status}</span><span>{moneyLabel(order.totalCents)}</span></li>)}</ul>:<p>Nenhum pedido registrado.</p>}<h4>Orçamentos recentes</h4>{detail.quotes.length?<ul>{detail.quotes.map(quote=><li key={quote.id}><strong>#{quote.id.slice(-8)}</strong><span>{date(quote.createdAt)} · {quote.status}</span></li>)}</ul>:<p>Nenhum orçamento registrado.</p>}<small>Até 10 pedidos e 10 orçamentos mais recentes.</small></>}
 </aside>}</div></section>;
}
