"use client";
import { centsToReais } from "@/lib/commerce/currency";
import PersonalizationModelField from "./PersonalizationModelField";
import styles from "@/app/admin/admin.module.css";
type Row=Record<string,unknown>;
export function editableVariants(value:unknown):Row[]{return Array.isArray(value)?value.map(v=>({...v,price:centsToReais(v.priceCents),useProductPrice:v.priceCents==null,expectedStock:v.stock})):[];}
export function editableTemplates(value:unknown,variants:unknown):Row[]{const rows=Array.isArray(variants)?variants:[];return Array.isArray(value)?value.filter(t=>t.active===true).map(t=>({...t,dirty:false,variantSkus:Array.isArray(t.variantIds)?rows.filter(v=>t.variantIds.includes(v.id)).map(v=>v.sku):[]})):[];}
export default function ProductCompositionFields({data,onChange,onUploadStateChange,disabled,error=""}:{data:Row;onChange:(key:string,value:unknown)=>void;onUploadStateChange:(busy:boolean)=>void;disabled:boolean;error?:string}){
 const variants=Array.isArray(data.variants)?data.variants as Row[]:[],templates=Array.isArray(data.templateDrafts)?data.templateDrafts as Row[]:[];
 const variant=(index:number,patch:Row)=>onChange("variants",variants.map((v,i)=>i===index?{...v,...patch}:v));
 return <>
  <section className={styles.compositionSection}><header><h3>Variações e estoque</h3><p>Cadastre as opções aqui. Remover uma opção salva a inativa, preservando o histórico.</p></header>
   {/varia|estoque|sku|atributo/i.test(error)&&<p role="alert">{error}</p>}
   {variants.map((v,index)=><fieldset className={styles.variantCard} disabled={disabled} key={String(v.id??index)}><legend>Opção {index+1}</legend><div className={styles.compactGrid}>
    <label>Nome<input required value={String(v.name??"")} onChange={e=>variant(index,{name:e.target.value})}/></label><label>SKU único<input required value={String(v.sku??"")} onChange={e=>variant(index,{sku:e.target.value})}/></label>
    {["Tamanho","Cor","Modelo","Capacidade"].map(label=><label key={label}>{label}<input value={String((v.attributes as Row)?.[label.toLowerCase()]??"")} onChange={e=>{const attributes={...(v.attributes as Row??{})};if(e.target.value.trim())attributes[label.toLowerCase()]=e.target.value;else delete attributes[label.toLowerCase()];variant(index,{attributes});}}/></label>)}
    <label><input type="checkbox" checked={v.useProductPrice===true} onChange={e=>variant(index,{useProductPrice:e.target.checked})}/> Usar preço base</label>
    {v.useProductPrice!==true&&<label>Preço (R$)<input required inputMode="decimal" value={String(v.price??"")} onChange={e=>variant(index,{price:e.target.value})}/></label>}
    <label><input type="checkbox" checked={v.stockControlled===true} onChange={e=>variant(index,{stockControlled:e.target.checked})}/> Controlar estoque</label>
    {v.stockControlled===true&&<label>Quantidade disponível<input type="number" min="0" step="1" required value={String(v.stock??0)} onChange={e=>variant(index,{stock:e.target.value===""?"":Number(e.target.value)})}/></label>}
    <label><input type="checkbox" checked={v.active===true} onChange={e=>variant(index,{active:e.target.checked})}/> Variação ativa</label>
   </div><button type="button" onClick={()=>onChange("variants",variants.filter((_,i)=>i!==index))}>Remover opção</button></fieldset>)}
   <button type="button" disabled={disabled||variants.length>=30} onClick={()=>onChange("variants",[...variants,{name:variants.length?"":"Padrão",sku:data.sku?`${data.sku}-${variants.length+1}`:"",attributes:{},price:"",useProductPrice:true,stockControlled:false,stock:0,lowStockThreshold:5,active:true}])}>Adicionar variação</button>
  </section>
  {data.mode==="CUSTOMIZABLE"&&<section className={styles.compositionSection}><header><h3>Modelo de personalização</h3></header>{/mockup|modelo|vista/i.test(error)&&<p role="alert">{error}</p>}<PersonalizationModelField value={data.personalizationModel} templates={templates} disabled={disabled} onChange={value=>onChange("personalizationModel",value)}/></section>}
 </>;
}
