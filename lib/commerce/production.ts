import type { DesignElement, PrintArea } from './validation';
export function presetLayout(area:PrintArea, index:number, count:number, value:string) {
 const width=Math.max(.01,area.width*.75),height=Math.max(.01,area.height*.3);
 return {value,x:area.x+area.width/2,y:Math.max(area.y+height/2,Math.min(area.y+area.height-height/2,area.y+area.height*(index+1)/(count+1))),width,height,rotation:0,color:'#211b1d',fontFamily:'Arial'};
}
export function effectiveDpi(e:DesignElement,a:PrintArea) {
 if(e.type!=='image'||!e.pixelWidth||!e.pixelHeight||!a.printWidthMm||!a.printHeightMm)return null;
 // Free transform can stretch axes independently; the most stretched axis sets the safe DPI.
 const normalizedPixel=Math.max(e.width/(e.pixelWidth*(e.imageCrop?.width??1)),e.height/(e.pixelHeight*(e.imageCrop?.height??1)));
 const mmPerNormalizedUnit=Math.max(a.printWidthMm/a.width,a.printHeightMm/a.height);
 return Math.floor(25.4/(normalizedPixel*mmPerNormalizedUnit));
}
export function productionManifest(elements:DesignElement[],areas:PrintArea[]) {
 return {schemaVersion:3,units:'mm',exportStatus:'PENDING_INDUSTRIAL_VALIDATION',artReview:'PENDING',elements:elements.map(e=>{
  const a=areas.find(a=>a.id===e.areaId)!;
  return {id:e.id,templateId:e.templateId,areaId:a.id,sourceAssetId:e.sourceAssetId??null,applicationMode:e.applicationMode??null,imageCrop:e.imageCrop??null,imageBackground:e.imageBackground??null,dpi:effectiveDpi(e,a),physical:a.printWidthMm&&a.printHeightMm?{centerX:(e.x-a.x)/a.width*a.printWidthMm,centerY:(e.y-a.y)/a.height*a.printHeightMm,width:e.width/a.width*a.printWidthMm,height:e.height/a.height*a.printHeightMm,rotation:e.rotation}:null};
 })};
}
