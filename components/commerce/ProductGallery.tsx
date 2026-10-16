"use client";
import { useRef, useState } from "react";
import styles from "./ProductGallery.module.css";
type Image={url:string;alt:string;position:number};
export default function ProductGallery({images,name}:{images:Image[];name:string}){
 const ordered=[...images].sort((a,b)=>a.position-b.position),[active,setActive]=useState(0),dialog=useRef<HTMLDialogElement>(null),image=ordered[active]??ordered[0];
 if(!image)return <div className={styles.empty}>Imagem ainda não cadastrada.</div>;
 return <div className={styles.gallery}><button type="button" className={styles.main} onClick={()=>dialog.current?.showModal()} aria-label="Ampliar imagem do produto"><img src={image.url} alt={image.alt||name} referrerPolicy="no-referrer"/><span>Ampliar imagem</span></button>
 <div className={styles.thumbnails} aria-label="Fotografias do produto">{ordered.map((item,index)=><button type="button" key={`${item.position}-${index}`} aria-label={`Ver imagem ${index+1}`} aria-pressed={index===active} onClick={()=>setActive(index)}><img src={item.url} alt={item.alt||`${name} · imagem ${index+1}`} loading="lazy" referrerPolicy="no-referrer"/></button>)}</div>
 <dialog ref={dialog} className={styles.dialog} onClick={e=>{if(e.target===e.currentTarget)dialog.current?.close();}}><button type="button" onClick={()=>dialog.current?.close()} aria-label="Fechar imagem ampliada">Fechar ×</button><img src={image.url} alt={image.alt||name} referrerPolicy="no-referrer"/></dialog></div>;
}
