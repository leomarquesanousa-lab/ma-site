import { db } from "@/lib/db";
import { activeProductWhere, publicProductSelect } from "@/lib/commerce/service";
import { ProductCards } from "./ProductCards";
import commerce from "@/app/commerce.module.css";
export default async function FeaturedProducts() {
  try {
    const products=await db.product.findMany({where:{...activeProductWhere,featured:true},select:publicProductSelect,take:8,orderBy:{createdAt:"desc"}});
    return <div className={commerce.shell}>{products.length?<ProductCards products={products}/>:<p>Nenhum produto em destaque cadastrado. <a href="/catalogo">Conhecer catálogo</a></p>}</div>;
  } catch { return <p>O catálogo de produtos está em preparação. <a href="/catalogo">Consultar catálogo</a></p>; }
}
