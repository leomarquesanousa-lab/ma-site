import type { Prisma } from "@prisma/client";
import { publicProductSelect } from "@/lib/commerce/service";
import styles from "@/app/commerce.module.css";
import { formatMoney } from "@/lib/commerce/validation";
export type PublicProduct = Prisma.ProductGetPayload<{select:typeof publicProductSelect}>;
export function ProductCards({products}:{products:PublicProduct[]}) {
  return <div className={styles.grid}>{products.map(p=><article className={styles.product} key={p.id}>{p.images[0]?<img src={p.images[0].url} alt={p.images[0].alt||p.name} loading="lazy"/>:<div className={styles.emptyImage}>Imagem não cadastrada</div>}<div><span className={styles.badge}>{p.mode==="QUOTE_ONLY"?"Sob orçamento":p.mode==="CUSTOMIZABLE"?"Personalizável":"Pronto para comprar"}</span><h2><a href={`/produtos/${p.slug}`}>{p.name}</a></h2><p>{p.shortDescription}</p>{p.mode!=="QUOTE_ONLY"&&p.priceCents!=null&&<p>Preço-base: <strong>{formatMoney(p.salePriceCents??p.priceCents)}</strong></p>}<a href={`/produtos/${p.slug}`}>Conhecer produto →</a></div></article>)}</div>;
}
