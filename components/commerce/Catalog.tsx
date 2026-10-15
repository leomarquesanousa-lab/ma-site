import { catalog, type Search } from "@/lib/commerce/catalog";
import styles from "@/app/commerce.module.css";
import { ProductCards } from "./ProductCards";
export default async function Catalog({ search, segments }: { search: Search; segments?: string[] }) {
  try {
    const result=await catalog(search,segments);
    const s=(key:string)=>typeof search[key]==="string"?String(search[key]):"";
    function pageUrl(page:number){const params=new URLSearchParams();for(const [key,value]of Object.entries(search))if(typeof value==="string")params.set(key,value);params.set("page",String(page));return `?${params}`;}
    return <main className={styles.shell}><header className={styles.heading}><span>Catálogo M.A.</span><h1>{result.scoped?.name??"Produtos e uniformes"}</h1><p>{result.scoped?.description??"Conheça os produtos cadastrados pela nossa equipe. Uniformes exclusivamente sob orçamento."}</p></header>
      <nav className={styles.tabs} aria-label="Categorias">{result.categories.filter(c=>!c.parentId).map(c=><a className={styles.button} key={c.id} href={`/colecoes/${c.slug}`}>{c.name}</a>)}</nav>
      {result.scoped&&<nav className={styles.tabs} aria-label="Subcategorias">{result.categories.filter(c=>c.parentId===result.scoped?.id).map(c=><a key={c.id} href={`/colecoes/${result.scoped?.slug}/${c.slug}`}>{c.name}</a>)}</nav>}
      <form className={styles.filters} method="GET"><label>Pesquisar<input name="q" defaultValue={s("q")} placeholder="Nome, descrição ou categoria"/></label><label>Categoria<select name="category" defaultValue={s("category")}><option value="">Todas</option>{result.categories.filter(c=>!result.scoped||c.id===result.scoped.id||c.parentId===result.scoped.id).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>Preço mínimo (R$)<input name="min" type="number" min="0" step="0.01" defaultValue={s("min")}/></label><label>Preço máximo (R$)<input name="max" type="number" min="0" step="0.01" defaultValue={s("max")}/></label><label>Atributo<input name="attribute" defaultValue={s("attribute")} placeholder="cor:azul ou tamanho:M"/></label><label>Disponibilidade<select name="availability" defaultValue={s("availability")}><option value="">Todas / sob demanda</option><option value="stock">Com estoque físico</option></select></label><label>Ordenar<select name="sort" defaultValue={s("sort")}><option value="">Novidades</option><option value="name">Nome</option><option value="price">Preço-base crescente</option><option value="price-desc">Preço-base decrescente</option></select></label><button>Aplicar filtros</button></form>
      <p>{result.total} produtos encontrados. Preços finais dependem da variação selecionada.</p><ProductCards products={result.products}/>
      {!result.products.length&&<p className={styles.notice}>Nenhum produto disponível nesta seleção. O catálogo exibirá somente produtos ativos cadastrados pela loja.</p>}
      <nav className={styles.pagination} aria-label="Paginação">{result.page>1&&<a href={pageUrl(result.page-1)}>Anterior</a>}<span>Página {result.page} de {result.pages}</span>{result.page<result.pages&&<a href={pageUrl(result.page+1)}>Próxima</a>}</nav>
    </main>;
  } catch { return <main className={styles.shell}><h1>Catálogo</h1><p className={styles.notice}>Catálogo temporariamente indisponível. A estrutura comercial precisa ser provisionada antes de receber produtos.</p></main>; }
}
