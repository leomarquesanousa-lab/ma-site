import type {Metadata} from "next";
import Catalog from "@/components/commerce/Catalog";
import {db} from "@/lib/db";
import type {Search} from "@/lib/commerce/catalog";
import {CommerceFooter,ContactBanner} from "@/components/CommercePresentation";
import styles from "@/app/premium.module.css";
import { categorySeo } from "@/lib/commerce/category-seo";
import { publicMetadata } from "@/lib/commerce/editor-metadata";
type Props={params:Promise<{segmentos:string[]}>;searchParams:Promise<Search>};
export async function generateMetadata({params}:Props):Promise<Metadata>{const segments=(await params).segmentos;try{if(!segments.length||segments.length>2)return {title:"Catálogo | MA Confecções"};const c=await db.category.findFirst({where:{slug:segments.at(-1),active:true,...(segments.length===1?{parentId:null}:{parent:{slug:segments[0],active:true,parentId:null}})},select:{id:true,name:true,description:true}});return c?publicMetadata({...c,...await categorySeo(c.id)}):{title:"Catálogo | MA Confecções"};}catch{return {title:"Catálogo | MA Confecções"};}}
export default async function CollectionPage({params,searchParams}:Props){return <div className={styles.home}><Catalog search={await searchParams} segments={(await params).segmentos}/><ContactBanner/><CommerceFooter/></div>;}
