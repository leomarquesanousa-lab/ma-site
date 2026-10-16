"use client";
import type { ReactNode } from "react";
import styles from "./AdminListLayout.module.css";
export type AdminColumn<T>={key:string;label:string;render:(row:T)=>ReactNode};
export default function AdminListLayout<T extends {id:string}>({rows,columns,view,onDetails,label,selectedId}:{rows:T[];columns:AdminColumn<T>[];view:'list'|'grid';onDetails:(row:T)=>void;label:string;selectedId?:string}){
 if(!rows.length)return <p className={styles.empty}>Nenhum resultado encontrado.</p>;
 return <div className={view==='grid'?styles.grid:styles.list}>
  <table aria-label={label}><thead><tr>{columns.map(c=><th scope="col" key={c.key}>{c.label}</th>)}<th scope="col">Ações</th></tr></thead><tbody>{rows.map(row=><tr key={row.id} data-selected={selectedId===row.id}>{columns.map((c,index)=><td key={c.key} data-label={c.label}>{index===0?<button type="button" className={styles.customerName} onClick={()=>onDetails(row)}>{c.render(row)}</button>:c.render(row)}</td>)}<td data-label="Ações"><button type="button" onClick={()=>onDetails(row)}>Ver detalhes <span aria-hidden="true">↗</span></button></td></tr>)}</tbody></table>
 </div>;
}
