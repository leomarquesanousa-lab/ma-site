"use client";
import { useEffect, useState } from "react";
import { commerceRequest, moneyLabel } from "./client";
import styles from "@/app/commerce.module.css";
type Row=Record<string,unknown>;
export default function CustomerWorkspace({module}:{module:"addresses"|"orders"}){
  const [rows,setRows]=useState<Row[]>([]),[message,setMessage]=useState(""),[busy,setBusy]=useState(false),[loaded,setLoaded]=useState(false);
  const load=()=>commerceRequest<Row[]>(module).then(setRows);
  useEffect(()=>{load().catch(e=>setMessage(e.message)).finally(()=>setLoaded(true));},[module]);
  return <><p role="status">{message}</p>{module==="addresses"&&<form className={styles.form} onSubmit={async e=>{e.preventDefault();const form=e.currentTarget;setBusy(true);try{await commerceRequest("addresses",Object.fromEntries(new FormData(form)));form.reset();await load();setMessage("Endereço cadastrado.");}catch(e){setMessage(e instanceof Error?e.message:"Falha.");}finally{setBusy(false);}}}><h2>Novo endereço</h2><div className={styles.formGrid}>{[["recipient","Destinatário"],["postalCode","CEP (8 números)"],["street","Rua"],["number","Número"],["complement","Complemento"],["district","Bairro"],["city","Cidade"],["state","UF"]].map(([key,label])=><label key={key}>{label}<input name={key} required={key!=="complement"} maxLength={key==="state"?2:key==="postalCode"?8:180}/></label>)}</div><div className={styles.actions}><button disabled={busy}>Salvar endereço</button></div></form>}
    <div className={styles.records}>{rows.map(row=><article className={styles.record} key={String(row.id)}>{module==="addresses"?<><h2>{String(row.recipient)}</h2><p>{String(row.street)}, {String(row.number)} · {String(row.city)}/{String(row.state)}</p><p>CEP {String(row.postalCode)}</p></>:<><h2>Pedido {String(row.id)}</h2><span className={styles.badge}>{String(row.status)}</span><p>Total de mercadorias: {moneyLabel(Number(row.totalCents))}</p><p>Pagamento: {String(row.paymentStatus)} · Frete: {String(row.shippingStatus)}</p><details><summary>Itens e acompanhamento</summary><pre>{JSON.stringify({items:row.items,history:row.history},null,2)}</pre></details></>}</article>)}</div>{loaded&&!rows.length&&<p>Nenhum registro encontrado.</p>}
  </>;
}
