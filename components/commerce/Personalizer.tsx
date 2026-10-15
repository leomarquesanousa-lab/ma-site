"use client";
import { useEffect, useRef, useState } from "react";
import type { DesignElement, PrintArea } from "@/lib/commerce/validation";
import { commerceRequest, uploadImage } from "./client";
import styles from "@/app/commerce.module.css";

type Template={id:string;name:string;baseImageUrl:string;maxFileBytes:number;areas:(PrintArea&{name:string})[]};
export default function Personalizer({productId,variantId,templates,onSaved}:{productId:string;variantId:string;templates:Template[];onSaved:(id:string)=>void}) {
  const [templateId,setTemplateId]=useState(templates[0]?.id??""),[elements,setElements]=useState<DesignElement[]>([]),[selected,setSelected]=useState(""),[areaId,setAreaId]=useState(templates[0]?.areas[0]?.id??""),[message,setMessage]=useState(""),[busy,setBusy]=useState(false);
  const canvas=useRef<HTMLDivElement>(null);
  const [saved,setSaved]=useState<{id:string;productId:string;variantId:string;templateId:string;composition:DesignElement[]}[]>([]);
  useEffect(()=>{let live=true;commerceRequest<typeof saved>("designs").then(rows=>{if(live)setSaved(rows.filter(d=>d.productId===productId&&d.variantId===variantId));}).catch(()=>{});return()=>{live=false;};},[productId,variantId]);
  const template=templates.find(t=>t.id===templateId),area=template?.areas.find(a=>a.id===areaId),element=elements.find(e=>e.id===selected);
  const drag=useRef<{id:string;dx:number;dy:number}|null>(null);
  function fit(e:DesignElement):DesignElement {
    const a=template?.areas.find(a=>a.id===e.areaId);if(!a)return e;
    const rad=e.rotation*Math.PI/180, c=Math.abs(Math.cos(rad)),s=Math.abs(Math.sin(rad));
    let width=e.width,height=e.height; const factor=Math.min(1,a.width/(width*c+height*s),a.height/(width*s+height*c));width*=factor;height*=factor;
    const bw=width*c+height*s,bh=width*s+height*c;
    return {...e,width,height,x:Math.min(a.x+a.width-bw/2,Math.max(a.x+bw/2,e.x)),y:Math.min(a.y+a.height-bh/2,Math.max(a.y+bh/2,e.y))};
  }
  function update(patch:Partial<DesignElement>){setElements(old=>old.map(e=>e.id===selected?fit({...e,...patch}):e));onSaved("");}
  function add(type:"text"|"image",value:string){if(!area)return;const e=fit({id:crypto.randomUUID(),areaId:area.id,type,value,x:area.x+area.width/2,y:area.y+area.height/2,width:Math.min(area.width*.8,.3),height:Math.min(area.height*.5,.15),rotation:0,color:"#211b1d"});setElements(old=>[...old,e]);setSelected(e.id);onSaved("");}
  async function fileSelected(file?:File){if(!file||!template)return;setBusy(true);setMessage("");try{if(file.size>template.maxFileBytes)throw new Error("Arquivo excede o limite deste modelo.");const asset=await uploadImage(file);if(element?.type==="image")update({value:asset.url});else add("image",asset.url);}catch(e){setMessage(e instanceof Error?e.message:"Falha no upload.");}finally{setBusy(false);}}
  if(!template||!area)return <p className={styles.notice}>Áreas de personalização ainda não configuradas para este produto.</p>;
  return <section><h2>Personalize seu produto</h2><p className={styles.notice}>Prévia 2D. A área tracejada delimita a impressão. Em canecas e outras superfícies curvas, esta visualização não simula curvatura, cor final ou renderização 3D.</p>
    <div className={styles.editor}><div ref={canvas} className={styles.canvas}>
      <img src={template.baseImageUrl} alt="Imagem-base do produto para personalização" draggable={false}/>
      {template.areas.map(a=><div key={a.id} className={styles.editorArea} style={{left:`${a.x*100}%`,top:`${a.y*100}%`,width:`${a.width*100}%`,height:`${a.height*100}%`}}/>)}
      {elements.map(e=><div key={e.id} role="button" tabIndex={0} aria-label={`Selecionar ${e.type==="text"?e.value:"imagem"}`} className={styles.element} data-selected={selected===e.id} style={{left:`${e.x*100}%`,top:`${e.y*100}%`,width:`${e.width*100}%`,height:`${e.height*100}%`,transform:`translate(-50%,-50%) rotate(${e.rotation}deg)`,color:e.color,fontSize:`${e.height*70}cqw`}} onFocus={()=>setSelected(e.id)} onKeyDown={event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();setSelected(e.id);}}} onPointerDown={event=>{const rect=canvas.current?.getBoundingClientRect();if(!rect)return;setSelected(e.id);drag.current={id:e.id,dx:(event.clientX-rect.left)/rect.width-e.x,dy:(event.clientY-rect.top)/rect.height-e.y};event.currentTarget.setPointerCapture(event.pointerId);}} onPointerMove={event=>{const d=drag.current,rect=canvas.current?.getBoundingClientRect();if(!d||d.id!==e.id||!rect)return;const x=(event.clientX-rect.left)/rect.width-d.dx,y=(event.clientY-rect.top)/rect.height-d.dy;setElements(old=>old.map(item=>item.id===e.id?fit({...item,x,y}):item));onSaved("");}} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}>{e.type==="image"?<img src={e.value} alt="Arte enviada pelo cliente" draggable={false}/>:e.value}</div>)}
    </div><div className={styles.editorControls}>
      {!!saved.length&&<label>Reabrir projeto salvo<select defaultValue="" onChange={e=>{const design=saved.find(d=>d.id===e.target.value);if(!design)return;const view=templates.find(t=>t.id===design.templateId);if(!view){setMessage("O modelo deste projeto foi substituído pela loja. Crie uma nova versão usando as áreas atuais.");return;}if(elements.length&&!confirm("Substituir os elementos atuais pelo projeto salvo?"))return;setTemplateId(view.id);setAreaId(view.areas[0]?.id??"");setElements(design.composition);setSelected("");onSaved(design.id);}}><option value="">Selecione um projeto</option>{saved.map(d=><option key={d.id} value={d.id}>{d.id}</option>)}</select></label>}
      <label>Vista<select value={templateId} onChange={e=>{if(elements.length&&!confirm("Trocar de vista descarta os elementos não salvos. Continuar?"))return;const t=templates.find(t=>t.id===e.target.value);setTemplateId(e.target.value);setAreaId(t?.areas[0]?.id??"");setElements([]);setSelected("");onSaved("");}}>{templates.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
      <label>Área de impressão<select value={areaId} onChange={e=>setAreaId(e.target.value)}>{template.areas.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
      <div className={styles.actions}>{area.allowText&&<button type="button" disabled={elements.length>=30} onClick={()=>add("text","Seu texto")}>Adicionar texto</button>}{area.allowImage&&<label>Adicionar / substituir imagem (PNG, JPEG, WebP; até {Math.floor(template.maxFileBytes/1024/1024)} MB)<input type="file" accept="image/png,image/jpeg,image/webp" disabled={busy||elements.length>=30} onChange={e=>fileSelected(e.target.files?.[0])}/></label>}</div>
      <label>Elemento selecionado<select value={selected} onChange={e=>setSelected(e.target.value)}><option value="">Selecione</option>{elements.map((e,i)=><option key={e.id} value={e.id}>{e.type==="text"?e.value:`Imagem ${i+1}`}</option>)}</select></label>
      {element&&<fieldset><legend>Editar elemento</legend>{element.type==="text"&&<><label>Texto<input maxLength={200} value={element.value} onChange={e=>update({value:e.target.value})}/></label><label>Cor<input type="color" value={element.color} onChange={e=>update({color:e.target.value})}/></label></>}{([['x','Posição horizontal',0,1,.005],['y','Posição vertical',0,1,.005],['width','Largura',.01,1,.005],['height','Altura',.01,1,.005],['rotation','Rotação',-180,180,1]] as const).map(([key,label,min,max,step])=><label key={key}>{label}<input type="range" min={min} max={max} step={step} value={element[key]} onChange={e=>update({[key]:Number(e.target.value)})}/></label>)}<button type="button" onClick={()=>{setElements(old=>old.filter(e=>e.id!==selected));setSelected("");onSaved("");}}>Remover elemento</button></fieldset>}
      <button type="button" disabled={busy||!variantId||!elements.length} onClick={async()=>{setBusy(true);try{const design=await commerceRequest<{id:string}>("designs",{productId,variantId,templateId,composition:elements});onSaved(design.id);setMessage("Projeto salvo. Você já pode adicioná-lo ao carrinho.");}catch(e){setMessage(e instanceof Error?e.message:"Falha ao salvar.");}finally{setBusy(false);}}}>{busy?"Salvando…":"Salvar personalização"}</button>
      <p role="status">{message}</p>
    </div></div>
  </section>;
}
