import type { DesignElement, PrintArea } from './validation';
export type ApplicationMode='FULL_WRAP'|'FULL_WRAP_COVER'|'SAFE_CONTAIN'|'CENTERED';
export function panImageCrop(element:DesignElement,dx:number,dy:number){
 const crop=element.imageCrop;if(!crop)return undefined;
 const angle=element.rotation*Math.PI/180,x=dx*Math.cos(angle)+dy*Math.sin(angle),y=-dx*Math.sin(angle)+dy*Math.cos(angle);
 return {...crop,x:Math.max(0,Math.min(1-crop.width,crop.x-x/element.width*crop.width)),y:Math.max(0,Math.min(1-crop.height,crop.y-y/element.height*crop.height))};
}
export function coverCrop(sourceRatio:number,targetRatio:number){
 if(!Number.isFinite(sourceRatio)||sourceRatio<=0||!Number.isFinite(targetRatio)||targetRatio<=0)throw Error('Proporção inválida.');
 const width=Math.min(1,targetRatio/sourceRatio),height=Math.min(1,sourceRatio/targetRatio);
 return {x:(1-width)/2,y:(1-height)/2,width,height};
}
export function readyArtLayout(area:PrintArea,ratio:number,mode:ApplicationMode='CENTERED',mug=false){
 if(!Number.isFinite(ratio)||ratio<=0)throw Error('Proporção da arte inválida.');
 if(mode==='FULL_WRAP'||mode==='FULL_WRAP_COVER')return {x:area.x+area.width/2,y:area.y+area.height/2,width:area.width*.98,height:area.height*.98,rotation:0,applicationMode:mode,imageCrop:coverCrop(ratio,area.printWidthMm&&area.printHeightMm?area.printWidthMm/area.printHeightMm:2048*.92/(850*.85))};
 if(mode==='SAFE_CONTAIN'){const physicalRatio=area.printWidthMm&&area.printHeightMm?area.printWidthMm/area.printHeightMm:2048*.92/(850*.85),fraction=Math.min(.9,.88*ratio/physicalRatio);return {x:area.x+area.width/2,y:area.y+area.height/2,width:area.width*fraction,height:area.height*fraction*physicalRatio/ratio,rotation:0,applicationMode:mode,imageCrop:undefined};}
 if(mug){const physicalRatio=area.printWidthMm&&area.printHeightMm?area.printWidthMm/area.printHeightMm:2048*.92/(850*.85),fraction=Math.min(.32,.6*ratio/physicalRatio);return {x:area.x+area.width/2,y:area.y+area.height/2,width:area.width*fraction,height:area.height*fraction*physicalRatio/ratio,rotation:0,applicationMode:mode,imageCrop:undefined};}
 const width=Math.min(area.width*.88,area.height*.88*ratio);
 return {x:area.x+area.width/2,y:area.y+area.height/2,width,height:width/ratio,rotation:0,applicationMode:mode,imageCrop:undefined};
}
export function withoutReadyArt(elements:DesignElement[],areaId:string,templateId:string){
 return elements.filter(e=>!(e.artworkId&&e.areaId===areaId&&(!e.templateId||e.templateId===templateId)));
}
export function insertBackground(elements:DesignElement[],additions:DesignElement[],areaId:string,templateId:string){
 const foreground=(e:DesignElement)=>e.type==='text'&&e.areaId===areaId&&(!e.templateId||e.templateId===templateId);
 return [...elements.filter(e=>!foreground(e)),...additions,...elements.filter(foreground)];
}
