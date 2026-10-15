import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { activeProductWhere, publicProductSelect } from "./service";

export type Search = Record<string, string | string[] | undefined>;
export async function catalog(search: Search, segments?: string[]) {
  const str = (key: string) => typeof search[key] === "string" ? String(search[key]).slice(0,180) : "";
  const q=str("q"), category=str("category"), availability=str("availability"), attribute=str("attribute"), sort=str("sort");
  const categories=await db.category.findMany({where:{active:true,OR:[{parentId:null},{parent:{active:true}}]},orderBy:[{position:"asc"},{name:"asc"}],select:{id:true,name:true,slug:true,parentId:true,description:true,imageUrl:true,parent:{select:{slug:true}}}});
  const scoped=segments?.length ? categories.find(c=>c.slug===segments.at(-1) && (segments.length===1?!c.parentId:c.parent?.slug===segments[0])) : null;
  if(segments?.length && !scoped) return { products:[],categories,scoped:null,total:0,page:1,pages:1 };
  const minRaw=str("min"),maxRaw=str("max");
  const parse=(v:string)=>/^\d{1,7}(\.\d{1,2})?$/.test(v)?Math.round(Number(v)*100):undefined;
  const min=parse(minRaw),max=parse(maxRaw);
  const prices={...(min!==undefined?{gte:min}:{}),...(max!==undefined?{lte:max}:{})};
  const where:Prisma.ProductWhereInput={...activeProductWhere,AND:[]};
  const and:Prisma.ProductWhereInput[]=[];
  const requested=categories.find(c=>c.id===category);
  const selected=scoped ? (requested && (requested.id===scoped.id || requested.parentId===scoped.id) ? requested : scoped) : requested;
  if(selected) and.push({OR:[{categoryId:selected.id},{category:{parentId:selected.id}}]});
  if(q) and.push({OR:[{name:{contains:q,mode:"insensitive"}},{description:{contains:q,mode:"insensitive"}},{category:{name:{contains:q,mode:"insensitive"}}}]});
  const variant:Prisma.ProductVariantWhereInput={active:true};
  if(availability==="stock") {variant.stockControlled=true;variant.stock={gt:0};}
  if(attribute) {const [key,...rest]=attribute.split(":");if(key&&rest.length) variant.attributes={path:[key],equals:rest.join(":")};}
  if(min!==undefined||max!==undefined) and.push({mode:{not:"QUOTE_ONLY"},OR:[{variants:{some:{...variant,priceCents:prices}}},{AND:[{OR:[{salePriceCents:prices},{salePriceCents:null,priceCents:prices}]},{variants:{some:{...variant,priceCents:null}}}]}]});
  else if(availability||attribute) and.push({variants:{some:variant}});
  where.AND=and;
  const orderBy:Prisma.ProductOrderByWithRelationInput=sort==="name"?{name:"asc"}:sort==="price"?{priceCents:"asc"}:sort==="price-desc"?{priceCents:"desc"}:{createdAt:"desc"};
  const total=await db.product.count({where});
  const pages=Math.max(1,Math.ceil(total/12));
  const page=Math.min(pages,Math.max(1,Number.parseInt(str("page"),10)||1));
  const products=await db.product.findMany({where,select:publicProductSelect,orderBy:[orderBy,{id:"asc"}],skip:(page-1)*12,take:12});
  return {products,categories,scoped,total,page,pages};
}
