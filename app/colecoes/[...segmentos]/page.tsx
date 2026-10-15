import type {Metadata} from "next";
import Catalog from "@/components/commerce/Catalog";
import {db} from "@/lib/db";
import type {Search} from "@/lib/commerce/catalog";
import {CommerceFooter,ContactBanner} from "@/components/CommercePresentation";
import styles from "@/app/premium.module.css";
type Props={params:Promise<{segmentos:string[]}>;searchParams:Promise<Search>};
export async function generateMetadata({params}:Props):Promise<Metadata>{const segments=(await params).segmentos;try{const c=await db.category.findFirst({where:{slug:segments.at(-1),active:true},select:{name:true,description:true}});return {title:`${c?.name??"Catálogo"} | M.A. Confecções e Brindes`,description:c?.description};}catch{return {title:"Catálogo | M.A."};}}
export default async function CollectionPage({params,searchParams}:Props){return <div className={styles.home}><Catalog search={await searchParams} segments={(await params).segmentos}/><ContactBanner/><CommerceFooter/></div>;}
