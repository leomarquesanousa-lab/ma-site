"use client";
import { useId } from 'react';
import type { DesignElement, PrintArea } from '@/lib/commerce/validation';
import ElementArtwork from './ElementArtwork';
import { cylindricalX, cylindricalY } from '@/lib/commerce/studio-geometry';
/** Illustrative surface projection only. Stored production coordinates remain flat. */
export default function MockupArtwork({elements,areas,curved}:{elements:DesignElement[];areas:PrintArea[];curved:boolean}){
 const id=useId().replaceAll(':','');
 return <svg viewBox="0 0 1000 1000" width="100%" height="100%" aria-hidden="true" style={{position:'absolute',inset:0,pointerEvents:'none',mixBlendMode:'multiply'}}>
  <defs><linearGradient id={`${id}-shade`}><stop stopColor="#211b1d" stopOpacity=".34"/><stop offset=".25" stopColor="#211b1d" stopOpacity="0"/><stop offset=".7" stopColor="#211b1d" stopOpacity="0"/><stop offset="1" stopColor="#211b1d" stopOpacity=".28"/></linearGradient>
  {areas.map((a,i)=><g key={a.id}><clipPath id={`${id}-clip-${i}`}><rect x={a.x*1000} y={a.y*1000} width={a.width*1000} height={a.height*1000} rx={curved?8:2}/></clipPath><g id={`${id}-scene-${i}`}>{elements.filter(e=>e.areaId===a.id).map(e=><g key={e.id} transform={`translate(${e.x*1000} ${e.y*1000}) rotate(${e.rotation})`}><svg x={-e.width*500} y={-e.height*500} width={e.width*1000} height={e.height*1000} overflow="hidden"><ElementArtwork element={e}/></svg></g>)}</g></g>)}
  </defs>
  {areas.map((a,i)=><g key={a.id} clipPath={`url(#${id}-clip-${i})`}>
   {elements.some(e=>e.areaId===a.id&&e.applicationMode==='SAFE_CONTAIN'&&e.imageBackground)&&<rect x={a.x*1000} y={a.y*1000} width={a.width*1000} height={a.height*1000} fill={[...elements].reverse().find(e=>e.areaId===a.id&&e.applicationMode==='SAFE_CONTAIN')?.imageBackground}/>}
   <g id={`${id}-projected-${i}`}>{curved?Array.from({length:96},(_,n)=>{const x=n/96,next=(n+1)/96,left=cylindricalX(x),right=cylindricalX(next);return <svg key={n} x={(a.x+left*a.width)*1000} y={(a.y+cylindricalY((x+next)/2)*a.height)*1000} width={(right-left)*a.width*1000+.05} height={(1-cylindricalY((x+next)/2)*2)*a.height*1000} viewBox={`${(a.x+x*a.width)*1000} ${a.y*1000} ${a.width*1000/96} ${a.height*1000}`} preserveAspectRatio="none" overflow="hidden"><use href={`#${id}-scene-${i}`}/></svg>;}):<use href={`#${id}-scene-${i}`}/>}</g>
   <mask id={`${id}-ink-${i}`} maskUnits="userSpaceOnUse" x={a.x*1000} y={a.y*1000} width={a.width*1000} height={a.height*1000} style={{maskType:'alpha'}}><use href={`#${id}-projected-${i}`}/></mask>
   <rect x={a.x*1000} y={a.y*1000} width={a.width*1000} height={a.height*1000} fill={`url(#${id}-shade)`} mask={`url(#${id}-ink-${i})`} opacity={curved?.65:.12}/>
  </g>)}
 </svg>;
}
