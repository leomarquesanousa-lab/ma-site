type Mockup={id:string;name:string;productType:string;variantIds:string[]};
/** A specific mockup overrides the general one only for the same product view. */
export function selectVariantMockups<T extends Mockup>(templates:T[],variantId:string):T[]{
 const views=new Map<string,T>();
 for(const template of templates){
  if(!['MUG','SHIRT'].includes(template.productType)||template.variantIds.length&&!template.variantIds.includes(variantId))continue;
  const key=`${template.productType}\0${template.name}`,previous=views.get(key);
  if(!previous||template.variantIds.length>0&&(!previous.variantIds.length||template.variantIds.length<previous.variantIds.length))views.set(key,template);
 }
 return [...views.values()];
}
