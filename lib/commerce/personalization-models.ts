import type {Prisma} from '@prisma/client';
import {CommerceError} from './errors';
import {selectVariantMockups} from './mockups';
import {choice,object,text} from './validation';

type Area={name:string;x:number;y:number;width:number;height:number;printWidthMm:number|null;printHeightMm:number|null;allowText:boolean;allowImage:boolean};
type View={id:string;name:string;productType:string;variantIds:string[];baseImageUrl:string;maxFileBytes:number;areas:Area[]};
export type ModelOption={key:string;name:string;productType:string;sourceProductId:string;sourceVariantId:string;views:number};
export function configuredViews(views:View[]){return views.length>0&&views.length<=10&&views.every(v=>v.baseImageUrl&&v.areas.length>0&&v.areas.every(a=>a.printWidthMm&&a.printHeightMm&&a.width>0&&a.height>0&&a.x>=0&&a.y>=0&&a.x+a.width<=1&&a.y+a.height<=1&&(a.allowText||a.allowImage)));}
export async function personalizationModels(tx:Prisma.TransactionClient){
 const products=await tx.product.findMany({where:{mode:'CUSTOMIZABLE',deletedAt:null,templates:{some:{active:true,productType:{in:['MUG','SHIRT']}}}},select:{id:true,name:true,variants:{where:{active:true},select:{id:true,name:true}},templates:{where:{active:true,productType:{in:['MUG','SHIRT']}},include:{areas:true}}},orderBy:{name:'asc'},take:200});
 const options:ModelOption[]=[];
 for(const product of products)for(const type of ['MUG','SHIRT']){
  const templates=product.templates.filter(t=>t.productType===type);
  const sources=[{id:'',name:''},...product.variants.filter(v=>templates.some(t=>t.variantIds.includes(v.id)))];
  for(const source of sources){const views=selectVariantMockups(templates,source.id);if(!configuredViews(views))continue;
   options.push({key:`${type}:${product.id}:${source.id}`,name:product.name+(source.name?' · '+source.name:''),productType:type,sourceProductId:product.id,sourceVariantId:source.id,views:views.length});
  }
 }
 return options;
}
export async function resolvePersonalizationModel(tx:Prisma.TransactionClient,raw:unknown){
 const value=object(raw),type=choice(value.productType,['MUG','SHIRT'],'Modelo: tipo'),sourceProductId=text(value.sourceProductId,'Modelo de personalização',100),sourceVariantId=text(value.sourceVariantId,'Variante do modelo',100,true);
 const source=await tx.product.findFirst({where:{id:sourceProductId,mode:'CUSTOMIZABLE',deletedAt:null},select:{id:true}});
 if(!source)throw new CommerceError('Modelo de personalização indisponível. Selecione outro modelo configurado.');
 if(sourceVariantId&&!await tx.productVariant.findFirst({where:{id:sourceVariantId,productId:sourceProductId,active:true},select:{id:true}}))throw new CommerceError('Variante do modelo indisponível.');
 const templates=await tx.customizationTemplate.findMany({where:{productId:sourceProductId,productType:type,active:true},include:{areas:true}});
 const views=selectVariantMockups(templates,sourceVariantId);
 if(!configuredViews(views))throw new CommerceError('Modelo incompleto. A configuração das áreas e medidas deve ser concluída no modelo, não neste produto.');
 return views;
}
