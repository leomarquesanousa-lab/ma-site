import type { ApplicationMode } from './ready-art-layout';
export type ArtAnalysis={transparentFraction:number;contentFraction:number;background:string};
export function analyzePixels(data:Uint8ClampedArray,width:number,height:number):ArtAnalysis{
 let transparent=0,left=width,top=height,right=-1,bottom=-1;const colors=new Map<string,{count:number;r:number;g:number;b:number}>();
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=(y*width+x)*4,a=data[i+3];if(a<240)transparent++;if(a>24){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}if(a>240&&(x<width*.15||x>width*.85||y<height*.15||y>height*.85)){const key=[data[i],data[i+1],data[i+2]].map(v=>Math.floor(v/32)).join(',');const color=colors.get(key)??{count:0,r:0,g:0,b:0};color.count++;color.r+=data[i];color.g+=data[i+1];color.b+=data[i+2];colors.set(key,color);}}
 const dominant=[...colors.values()].sort((a,b)=>b.count-a.count)[0];
 const background=dominant?'#'+[dominant.r,dominant.g,dominant.b].map(v=>Math.round(v/dominant.count).toString(16).padStart(2,'0')).join(''):'#f7f5f2';
 return {transparentFraction:transparent/(width*height),contentFraction:right<left?0:(right-left+1)*(bottom-top+1)/(width*height),background};
}
export function analyzeArtImage(image:CanvasImageSource){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)throw Error('Análise da imagem indisponível.');ctx.drawImage(image,0,0,64,64);return analyzePixels(ctx.getImageData(0,0,64,64).data,64,64);
}
export function chooseArtMode({ratio,metadata='',source,hasTextPreset=false,analysis}:{ratio:number;metadata?:string;source:'library'|'upload';mime?:string;hasTextPreset?:boolean;analysis:ArtAnalysis}):Exclude<ApplicationMode,'FULL_WRAP'>{
 const words=metadata.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[_-]+/g,' ').toLowerCase();
 if(/\b(logo|logotipo|logomarca|marca empresarial)\b/.test(words))return 'CENTERED';
 if(hasTextPreset||/\b(texto|frase|banner|layout|feliz aniversario|happy birthday|parabens|mensagem|tipografia)\b/.test(words))return 'SAFE_CONTAIN';
 if(analysis.transparentFraction>.08&&analysis.contentFraction<.65)return 'CENTERED';
 if(analysis.transparentFraction>.03)return 'SAFE_CONTAIN';
 if(/\b(foto|fotografia|photograph|estampa corrida|padrao|pattern|textura|decorativa sem texto)\b/.test(words))return 'FULL_WRAP_COVER';
 if(ratio>=2.1||ratio<=.45)return 'SAFE_CONTAIN';
 if(source==='upload'&&(/\b(img|dsc|photo)[_-]?\d+/i.test(metadata)))return 'FULL_WRAP_COVER';
 // Unknown finished library layouts are safe by default; no OCR inference is claimed.
 return 'SAFE_CONTAIN';
}
