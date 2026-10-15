import Catalog from "@/components/commerce/Catalog";
import type { Search } from "@/lib/commerce/catalog";
export const metadata={title:"Catálogo | M.A. Confecções e Brindes"};
export default async function CatalogPage({searchParams}:{searchParams:Promise<Search>}) {return <Catalog search={await searchParams}/>;}
