import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { activeProductWhere, publicProductSelect } from "@/lib/commerce/service";
import ProductPurchase from "@/components/commerce/ProductPurchase";
import { ProductCards } from "@/components/commerce/ProductCards";
import styles from "@/app/commerce.module.css";
import type { Metadata } from "next";
type Props={params:Promise<{slug:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata> {
  try{const p=await db.product.findFirst({where:{slug:(await params).slug,...activeProductWhere},select:{name:true,shortDescription:true,seoTitle:true,seoDescription:true}});return {title:p?`${p.seoTitle||p.name} | M.A.`:"Produto | M.A.",description:p?.seoDescription||p?.shortDescription};}catch{return{title:"Produto | M.A."};}
}
export default async function ProductPage({params}:Props) {
  const slug=(await params).slug;
  let product;try{product=await db.product.findFirst({where:{slug,...activeProductWhere},select:publicProductSelect});}catch{return <main className={styles.shell}><h1>Produto temporariamente indisponível</h1><p>O catálogo comercial precisa estar provisionado e disponível.</p></main>;}
  if(!product)notFound();
  const related=await db.product.findMany({where:{...activeProductWhere,categoryId:product.category.id,id:{not:product.id}},select:publicProductSelect,take:3});
  return <main className={styles.shell}><nav aria-label="Caminho de navegação"><a href="/catalogo">Catálogo</a> / {product.name}</nav><header className={styles.heading}><span>{product.category.name}</span><h1>{product.name}</h1><p>{product.shortDescription}</p></header><div className={styles.productDetail}><div className={styles.gallery}>{product.images.length?product.images.map(image=><img key={image.position} src={image.url} alt={image.alt||product.name}/>):<p>Imagem ainda não cadastrada.</p>}</div><div><p style={{whiteSpace:"pre-wrap"}}>{product.description}</p><ProductPurchase product={product}/></div></div>{related.length>0&&<section><h2>Produtos relacionados</h2><ProductCards products={related}/></section>}</main>;
}
