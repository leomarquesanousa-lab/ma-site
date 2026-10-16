import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { activeProductWhere, publicProductSelect } from "@/lib/commerce/service";
import ProductPurchase from "@/components/commerce/ProductPurchase";
import { ProductCards } from "@/components/commerce/ProductCards";
import styles from "@/app/commerce.module.css";
import type { Metadata } from "next";
import { publicMetadata } from "@/lib/commerce/editor-metadata";
import ProductGallery from "@/components/commerce/ProductGallery";
type Props={params:Promise<{slug:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata> {
  try{const p=await db.product.findFirst({where:{slug:(await params).slug,...activeProductWhere},select:{name:true,description:true,shortDescription:true,seoTitle:true,seoDescription:true}});return p?publicMetadata(p):{title:"Produto | MA Confecções"};}catch{return{title:"Produto | MA Confecções"};}
}
export default async function ProductPage({params}:Props) {
  const slug=(await params).slug;
  let product;try{product=await db.product.findFirst({where:{slug,...activeProductWhere},select:publicProductSelect});}catch{return <main className={`${styles.shell} ${styles.publicCommerce}`}><h1>Produto temporariamente indisponível</h1><p>O catálogo comercial precisa estar provisionado e disponível.</p></main>;}
  if(!product)notFound();
  const related=await db.product.findMany({where:{...activeProductWhere,categoryId:product.category.id,id:{not:product.id}},select:publicProductSelect,take:3});
  return <main className={`${styles.shell} ${styles.publicCommerce}`}><nav className={styles.breadcrumb} aria-label="Caminho de navegação"><a href="/catalogo">Catálogo</a> / {product.name}</nav><ProductPurchase allowMug3D={process.env.MA_HOMOLOGATION==='1'&&process.env.MA_RUNTIME==='homologation'} product={product} heading={<header className={styles.heading}><span>{product.category.name}</span><h1>{product.name}</h1><p>{product.shortDescription}</p></header>} gallery={<ProductGallery images={product.images} name={product.name}/>} details={<details className={styles.productDescription}><summary>Detalhes do produto</summary><p style={{whiteSpace:"pre-wrap"}}>{product.description}</p></details>}/>{related.length>0&&<section><h2>Produtos relacionados</h2><ProductCards products={related}/></section>}</main>;
}
