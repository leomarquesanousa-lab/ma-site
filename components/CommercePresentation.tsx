import styles from "@/app/premium.module.css";
import { collectionUrl, collections, whatsapp } from "@/app/collections";

export function Arrow() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7" /></svg>;
}

export function ProductVisual({ slug, name }: { slug: string; name: string }) {
  if (["potes", "squeezes"].includes(slug)) {
    return <div className={styles.productDrawing} role="img" aria-label={`${name}: representação ilustrativa, modelo não definido`}>
      <svg viewBox="0 0 240 230" fill="none" aria-hidden="true">
        {slug === "potes" ? <><rect x="62" y="65" width="116" height="127" rx="22" fill="#FFFFFF" stroke="#781834" strokeWidth="2" /><rect x="58" y="48" width="124" height="25" rx="7" fill="#781834" /><path d="M65 90h110" stroke="#B89154" /></> : <><path d="M94 49V30h52v19l12 18v125c0 12-76 12-76 0V67l12-18z" fill="#FFFFFF" stroke="#781834" strokeWidth="2" /><path d="M94 30h52v16H94z" fill="#781834" /><path d="M111 30V19h18v11M83 82h74" stroke="#B89154" strokeWidth="2" /></>}
        <text x="120" y="126" textAnchor="middle" fill="#781834" fontSize="13" letterSpacing="2">SUA</text><text x="120" y="147" textAnchor="middle" fill="#781834" fontSize="13" letterSpacing="2">MARCA</text>
      </svg>
      <span>Conceito ilustrativo · linha em preparação</span>
    </div>;
  }
  const apparel = ["camisetas", "polos", "jaquetas"].includes(slug);
  return <img className={styles.productPhoto} src={apparel ? "/MA-SITE-CONFECCOES.png" : "/ma-SITE-BRINDES.png"} alt={`${name} — imagem de referência da linha, não de um modelo específico`} width="1448" height="1086" loading="lazy" />;
}

export function ContactBanner() {
  return <section className={styles.contact} id="orcamento">
    <div className={`${styles.container} ${styles.contactInner}`}>
      <div><span className={styles.eyebrow}>Seu próximo projeto começa aqui</span><h2>Uma marca forte.<br />Uma equipe à altura.</h2><p>Vamos conversar sobre uniformes, personalizados ou brindes para a sua empresa.</p></div>
      <div className={styles.contactAction}><a className={styles.lightButton} href={whatsapp} target="_blank" rel="noopener noreferrer">Solicitar orçamento <Arrow /></a><span>Atendimento pelo WhatsApp</span></div>
    </div>
  </section>;
}

export function CommerceFooter() {
  return <footer className={styles.footer}>
    <div className={`${styles.container} ${styles.footerGrid}`}>
      <div className={styles.footerBrand}><img src="/logo-ma.jpg" alt="M.A. Confecções e Brindes" width="1600" height="533" loading="lazy" /><p>Uniformes, personalizados e brindes.<br />Identidade em cada detalhe.</p></div>
      <div><h3>Soluções</h3>{collections.map((collection) => <a key={collection.slug} href={collectionUrl(collection.slug)}>{collection.name}</a>)}<a href="/#personalize">Personalização online — em breve</a></div>
      <div><h3>Atendimento</h3><a href={whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a><a href="/minha-conta">Minha conta</a><a href="/#orcamento">Solicitar orçamento</a></div>
      <div><h3>Conecte-se</h3><a href="https://www.instagram.com/maconfeccoesebrindes" target="_blank" rel="noopener noreferrer">Instagram</a><a href="https://app.maconfeccoes.com.br" target="_blank" rel="noopener noreferrer">MA System</a></div>
    </div>
    <div className={`${styles.container} ${styles.footerBottom}`}><span>© 2026 M.A. Confecções e Brindes</span><span>CNPJ 57.739.176/0001-87</span></div>
  </footer>;
}
