"use client";
import { useEffect, useState } from 'react';
import type { DesignElement } from '@/lib/commerce/validation';
type Bounds={x:number;y:number;width:number;height:number;line:number};
export default function ElementArtwork({element:e}:{element:DesignElement}){
 const lines=e.value.split('\n'),[bounds,setBounds]=useState<Bounds>({x:0,y:-80,width:Math.max(1,...lines.map(l=>l.length))*60,height:lines.length*110,line:110});
 useEffect(()=>{if(e.type!=='text')return;let live=true;function measure(){if(!live)return;const ctx=document.createElement('canvas').getContext('2d');if(!ctx)return;ctx.font=`100px "${e.fontFamily??'Arial'}"`;const rows=e.value.split('\n').map(l=>ctx.measureText(l||' ')),line=110;const left=Math.max(0,...rows.map(m=>m.actualBoundingBoxLeft||0)),right=Math.max(1,...rows.map(m=>m.actualBoundingBoxRight||m.width)),ascent=rows[0].actualBoundingBoxAscent||75,descent=rows.at(-1)?.actualBoundingBoxDescent||20;setBounds({x:-left,y:-ascent,width:left+right,height:(rows.length-1)*line+ascent+descent,line});}measure();void document.fonts.ready.then(measure);return()=>{live=false;};},[e.type,e.value,e.fontFamily]);
 if(e.type==='image'){const crop=e.imageCrop??{x:0,y:0,width:1,height:1};return <svg width="100%" height="100%" viewBox={`${crop.x} ${crop.y} ${crop.width} ${crop.height}`} preserveAspectRatio="none" aria-hidden="true" style={{overflow:'hidden'}}><image href={e.value} width="1" height="1" preserveAspectRatio="none"/></svg>;}
 return <svg width="100%" height="100%" viewBox={`${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`} preserveAspectRatio="none" aria-hidden="true" style={{overflow:'hidden'}}><text fill={e.color} fontFamily={e.fontFamily??'Arial'} fontSize="100" xmlSpace="preserve">{lines.map((line,i)=><tspan key={i} x="0" y={i*bounds.line}>{line||' '}</tspan>)}</text></svg>;
}
