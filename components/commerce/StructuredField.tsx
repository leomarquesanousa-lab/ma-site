"use client";
import { useState } from "react";
import { uploadImage } from "./client";
import styles from "@/app/commerce.module.css";
type Row=Record<string,unknown>;
const configurations:Record<string,{name:string;label:string;type?:"number"|"checkbox"}[]>={
  images:[{name:"url",label:"Imagem (URL local ou upload)"},{name:"alt",label:"Descrição acessível"}],
  options:[{name:"name",label:"Nome da opção"},{name:"values",label:"Valores, separados por vírgula"}],
  areas:[{name:"name",label:"Nome da área"},{name:"x",label:"Início horizontal (0–1)",type:"number"},{name:"y",label:"Início vertical (0–1)",type:"number"},{name:"width",label:"Largura (0–1)",type:"number"},{name:"height",label:"Altura (0–1)",type:"number"},{name:"allowText",label:"Permitir texto",type:"checkbox"},{name:"allowImage",label:"Permitir imagem",type:"checkbox"},{name:"printWidthMm",label:"Largura de impressão (mm)",type:"number"},{name:"printHeightMm",label:"Altura de impressão (mm)",type:"number"}],
};
export function StructuredField({name,value,onChange,productId,onUploadStateChange}:{name:string;value:unknown;onChange:(value:unknown)=>void;productId?:string;onUploadStateChange?:(busy:boolean)=>void}){
  const [error,setError]=useState(""),[busy,setBusy]=useState(false);
  const [progress,setProgress]=useState("");
  if(name==="baseImageUrl") return <div className={styles.structured}>
    {typeof value==="string"&&/^\/(?!\/)/.test(value)&&<img className={styles.galleryPreview} src={value} alt="Prévia da imagem-base"/>}
    <input aria-label="Referência da imagem-base" required value={String(value??"")} onChange={e=>onChange(e.target.value)}/>
    <label>Enviar imagem-base<input type="file" disabled={busy} accept="image/png,image/jpeg,image/webp" onChange={async e=>{
      const file=e.target.files?.[0];e.target.value="";if(!file)return;setBusy(true);onUploadStateChange?.(true);setError("");setProgress("Enviando imagem-base…");
      try{const asset=await uploadImage(file,"mockup",productId);onChange(asset.url);setProgress("Imagem enviada. Salve a configuração para aplicar.");}
      catch(e){setError(e instanceof Error?e.message:"Falha no upload.");setProgress("");}
      finally{setBusy(false);onUploadStateChange?.(false);}
    }}/></label><span role="status">{progress}</span>{error&&<p role="alert" className={styles.error}>{error}</p>}
  </div>;
  const imageRows=Array.isArray(value)?value as Row[]:[];
  if(name==="images") {
    async function uploadFiles(files:File[]) {
        if(!files.length)return;
        if(files.length+imageRows.length>20){setError("A galeria aceita até 20 imagens.");return;}
        if(files.some(f=>!f.size||f.size>5242880||!["image/png","image/jpeg","image/webp"].includes(f.type))){setError("Selecione imagens PNG, JPEG ou WebP de até 5 MB.");return;}
        setBusy(true);onUploadStateChange?.(true);setError("");const added:Row[]=[];
        try{for(let i=0;i<files.length;i++){setProgress(`Enviando ${i+1} de ${files.length}…`);const asset=await uploadImage(files[i],"catalog",productId);added.push({url:asset.url,alt:""});}setProgress(`${added.length} imagem(ns) enviada(s). Salve o produto para aplicar.`);}
        catch(e){setError(e instanceof Error?e.message:"Upload indisponível.");setProgress(`${added.length} imagem(ns) enviada(s) antes da interrupção.`);}
        finally{if(added.length)onChange([...imageRows,...added]);setBusy(false);onUploadStateChange?.(false);}

    }
    const move=(from:number,to:number)=>{const next=[...imageRows];const [item]=next.splice(from,1);next.splice(to,0,item);onChange(next);};
    return <div className={`${styles.structured} ${styles.galleryDropzone}`} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();if(!busy)void uploadFiles(Array.from(e.dataTransfer.files));}}>
      <p>Até 20 imagens. A primeira é a capa. Alterações na galeria são aplicadas ao salvar o produto.</p>
      <div className={styles.galleryManager}>{imageRows.map((row,index)=><fieldset key={index} className={styles.galleryItem} disabled={busy}>
        <legend>{index===0?"Capa do produto":`Imagem ${index+1}`}</legend>
        {typeof row.url==="string" && (/^\/(?!\/)/.test(row.url)||/^https:\/\//.test(row.url)) && <img src={row.url} alt={String(row.alt||`Prévia ${index+1}`)} className={styles.galleryPreview} referrerPolicy="no-referrer"/>}
        <label>Imagem (upload ou URL HTTPS)<input value={String(row.url??"")} onChange={e=>onChange(imageRows.map((r,i)=>i===index?{...r,url:e.target.value}:r))}/></label>
        <label>Descrição acessível<input value={String(row.alt??"")} onChange={e=>onChange(imageRows.map((r,i)=>i===index?{...r,alt:e.target.value}:r))}/></label>
        <div className={styles.galleryActions}>
          <button type="button" disabled={index===0} onClick={()=>move(index,0)}>Definir capa</button>
          <button type="button" aria-label={`Mover imagem ${index+1} para antes`} disabled={index===0} onClick={()=>move(index,index-1)}>Antes</button>
          <button type="button" aria-label={`Mover imagem ${index+1} para depois`} disabled={index===imageRows.length-1} onClick={()=>move(index,index+1)}>Depois</button>
          <button type="button" onClick={()=>onChange(imageRows.filter((_,i)=>i!==index))}>Remover da galeria</button>
        </div>
      </fieldset>)}</div>
      <button type="button" disabled={busy||imageRows.length>=20} onClick={()=>onChange([...imageRows,{url:"",alt:""}])}>Adicionar imagem por referência</button>
      <label>Enviar imagens (PNG, JPEG ou WebP; até 5 MB cada)<input type="file" multiple disabled={busy||imageRows.length>=20} accept="image/png,image/jpeg,image/webp" onChange={e=>{const files=Array.from(e.target.files??[]);e.target.value="";void uploadFiles(files);}}/></label>
      <p role="status" aria-live="polite">{progress}</p>{error&&<p role="alert" className={styles.error}>{error}</p>}
      <small>Remover desvincula a imagem ao salvar. O arquivo original é preservado para proteger referências e histórico.</small>
    </div>;
  }
  if(name==="dimensions"){
    const data=(value&&typeof value==="object"?value:{}) as Row;
    return <div>{[["width","Largura (cm)"],["height","Altura (cm)"],["length","Comprimento (cm)"]].map(([key,label])=><label key={key}>{label}<input type="number" min="1" max="1000" value={String(data[key]??"")} onChange={e=>onChange({...data,[key]:Number(e.target.value)})}/></label>)}<button type="button" onClick={()=>onChange(null)}>Limpar dimensões</button></div>;
  }
  if(name==="attributes"){
    const data=(value&&typeof value==="object"?value:{}) as Row;
    const entries=Object.entries(data);
    return <div>{entries.map(([key,v],i)=><div className={styles.attributeRow} key={i}><input aria-label="Nome do atributo" placeholder="Cor, tamanho, tecido…" value={key} onChange={e=>{const next=entries.map((pair,index)=>index===i?[e.target.value,pair[1]]:pair);onChange(Object.fromEntries(next));}}/><input aria-label="Valor do atributo" value={String(v)} onChange={e=>onChange({...data,[key]:e.target.value})}/><button type="button" onClick={()=>onChange(Object.fromEntries(entries.filter(([k])=>k!==key)))}>Remover</button></div>)}<button type="button" onClick={()=>onChange({...data,[`atributo${entries.length+1}`]:""})}>Adicionar atributo</button></div>;
  }
  const fields=configurations[name],rows=Array.isArray(value)?value as Row[]:[];
  if(!fields)return null;
  return <div className={styles.structured}>
    {rows.map((row,index)=><fieldset key={index}><legend>Item {index+1}</legend>{fields.map(field=><label key={field.name}>{field.label}{field.type==="checkbox"?<input type="checkbox" checked={row[field.name]===true} onChange={e=>onChange(rows.map((r,i)=>i===index?{...r,[field.name]:e.target.checked}:r))}/>:<input type={field.type==="number"?"number":"text"} step={field.type==="number"?"any":undefined} value={Array.isArray(row[field.name])?(row[field.name] as string[]).join(", "):String(row[field.name]??"")} onChange={e=>{const text=e.target.value;const val=field.name==="values"?text.split(",").map(s=>s.trim()).filter(Boolean):field.type==="number"?(text===""?null:Number(text)):text;onChange(rows.map((r,i)=>i===index?{...r,[field.name]:val}:r));}}/>}</label>)}<button type="button" onClick={()=>onChange(rows.filter((_,i)=>i!==index))}>Remover item</button></fieldset>)}
    <button type="button" onClick={()=>onChange([...rows,name==="areas"?{name:"Área",x:.25,y:.25,width:.5,height:.5,allowText:true,allowImage:true}:name==="options"?{name:"",values:[]}:{url:"",alt:""}])}>Adicionar {name==="areas"?"área":name==="images"?"imagem":"opção"}</button>
    {error&&<p role="alert">{error}</p>}
  </div>;
}
