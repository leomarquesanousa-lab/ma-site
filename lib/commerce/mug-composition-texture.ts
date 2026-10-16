import type { DesignElement, PrintArea } from './validation';
export type MugComposition={elements:DesignElement[];areas:PrintArea[]};
/** Preview-only: configured printable bounds fill the cylindrical atlas band, seam at the handle. */
export function texturePlacement(areas:PrintArea[],width:number,height:number){
 if(!areas.length)throw Error('Área de impressão não configurada.');
 const left=Math.min(...areas.map(a=>a.x)),top=Math.min(...areas.map(a=>a.y)),right=Math.max(...areas.map(a=>a.x+a.width)),bottom=Math.max(...areas.map(a=>a.y+a.height));
 const ratio=areas.length===1&&areas[0].printWidthMm&&areas[0].printHeightMm?areas[0].printWidthMm/areas[0].printHeightMm:2048*.92/(850*.85);
 const targetWidth=Math.min(width*.92,height*.85*ratio),targetHeight=targetWidth/ratio,xScale=targetWidth/(right-left),yScale=targetHeight/(bottom-top);
 return {xScale,yScale,x:(width-targetWidth)/2-left*xScale,y:(height-targetHeight)/2-top*yScale};
}
export function printBoardSize(area:PrintArea){const ratio=area.printWidthMm&&area.printHeightMm?area.printWidthMm/area.printHeightMm:2048*.92/(850*.85),width=Math.min(2048,Math.round(1024*ratio)),height=Math.max(1,Math.round(width/ratio));return {width,height};}
export async function paintMugComposition(canvas:HTMLCanvasElement,color:string,composition:MugComposition,load:(url:string)=>Promise<ImageBitmap>,cancelled:()=>boolean){
 // Draw atomically into a staging canvas, never leaving a partially loaded texture visible.
 const staging=document.createElement('canvas');staging.width=canvas.width;staging.height=canvas.height;
 const ctx=staging.getContext('2d');if(!ctx)throw Error('Canvas indisponível.');
 const images=new Map<string,ImageBitmap>();for(const e of composition.elements){if(e.type==='image'&&!images.has(e.value)){images.set(e.value,await load(e.value));if(cancelled())return false;}}
 await document.fonts.ready;if(cancelled())return false;
 ctx.fillStyle=color;ctx.fillRect(0,0,staging.width,staging.height);
 const placement=texturePlacement(composition.areas,staging.width,staging.height);
 for(const area of composition.areas){
  const size=printBoardSize(area),board=document.createElement('canvas');board.width=size.width;board.height=size.height;const boardCtx=board.getContext('2d');if(!boardCtx)throw Error('Prancheta indispon\u00edvel.');
  const members=composition.elements.filter(e=>e.areaId===area.id),background=[...members].reverse().find(e=>e.applicationMode==='SAFE_CONTAIN'&&e.imageBackground)?.imageBackground??color;
  boardCtx.fillStyle=background;boardCtx.fillRect(0,0,board.width,board.height);boardCtx.scale(board.width/area.width,board.height/area.height);boardCtx.translate(-area.x,-area.y);
  for(const e of members){const a=area,ctx=boardCtx;
  ctx.save();ctx.beginPath();ctx.rect(a.x,a.y,a.width,a.height);ctx.clip();ctx.translate(e.x,e.y);ctx.rotate(e.rotation*Math.PI/180);ctx.beginPath();ctx.rect(-e.width/2,-e.height/2,e.width,e.height);ctx.clip();
  if(e.type==='image'){const image=images.get(e.value)!,crop=e.imageCrop??{x:0,y:0,width:1,height:1};ctx.drawImage(image,crop.x*image.width,crop.y*image.height,crop.width*image.width,crop.height*image.height,-e.width/2,-e.height/2,e.width,e.height);}
  else{
   ctx.font=`100px "${e.fontFamily??'Arial'}"`;ctx.textBaseline='alphabetic';ctx.textAlign='left';ctx.fillStyle=e.color;
   const lines=e.value.split('\n'),metrics=lines.map(line=>ctx.measureText(line||' ')),left=Math.max(0,...metrics.map(m=>m.actualBoundingBoxLeft||0)),right=Math.max(1,...metrics.map(m=>m.actualBoundingBoxRight||m.width)),ascent=metrics[0].actualBoundingBoxAscent||75,descent=metrics.at(-1)?.actualBoundingBoxDescent||20,height=(lines.length-1)*110+ascent+descent;
   ctx.translate(-e.width/2,-e.height/2);ctx.scale(e.width/(left+right),e.height/height);ctx.translate(left,ascent);lines.forEach((line,i)=>ctx.fillText(line||' ',0,i*110));
  }ctx.restore();
 }
  ctx.drawImage(board,placement.x+area.x*placement.xScale,placement.y+area.y*placement.yScale,area.width*placement.xScale,area.height*placement.yScale);
 }
 if(cancelled())return false;const destination=canvas.getContext('2d');if(!destination)throw Error('Canvas indisponível.');destination.clearRect(0,0,canvas.width,canvas.height);destination.drawImage(staging,0,0);return true;
}
