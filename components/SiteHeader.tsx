"use client";

import { useState, useRef } from "react";
import styles from "@/app/premium.module.css";
import { collections, collectionUrl } from "@/app/collections";

const links = [
  ["Catálogo", "/catalogo"],
  ["Personalize online", "/#personalize"],
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  return (
    <header className={styles.header} onKeyDown={(event) => { if (event.key === "Escape" && menuOpen) { setMenuOpen(false); menuButton.current?.focus(); } }}>
      <div className={styles.topBar}><div className={styles.container}><span>Uniformes profissionais. Identidade para a sua marca.</span><a href="https://wa.me/5511947944345" target="_blank" rel="noopener noreferrer">Atendimento pelo WhatsApp <span aria-hidden="true">↗</span></a></div></div>
      <div className={`${styles.container} ${styles.headerMain}`}>
        <a className={styles.brand} href="/" aria-label="M.A. Confecções e Brindes — início"><img src="/logo-ma.jpg" alt="M.A. Confecções e Brindes" width="1600" height="533" /></a>
        <nav className={styles.desktopNav} aria-label="Navegação principal">
          {collections.map((collection) => <div className={styles.navGroup} key={collection.slug}>
            <a href={collectionUrl(collection.slug)}>{collection.shortName}<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 9l7 7 7-7" /></svg></a>
            <div className={styles.navDropdown}><span>{collection.label}</span>{collection.items.map((item) => <a key={item.slug} href={collectionUrl(collection.slug, item.slug)}>{item.name}</a>)}<a href={collectionUrl(collection.slug)}>Ver a categoria →</a></div>
          </div>)}
          {links.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
        </nav>
        <div className={styles.headerActions}>
          <a className={styles.account} href="/carrinho" aria-label="Meu carrinho"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 3h2l3 12h10l3-9H6"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg></a>
          <div className={`${styles.navGroup} ${styles.accountMenu}`}>
            <a className={styles.account} href="/minha-conta" aria-label="Minha conta"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21v-2a8 8 0 0116 0v2" /></svg><span>Minha conta</span></a>
            <div className={styles.navDropdown}>
              <a href="/login">Entrar</a>
              <a href="/cadastro">Criar minha conta</a>
              <a href="/minha-conta">Acessar minha conta</a>
            </div>
          </div>
          <a className={styles.headerQuote} href="/#orcamento">Orçamento <span aria-hidden="true">↗</span></a>
          <button ref={menuButton} type="button" className={styles.menuToggle} aria-expanded={menuOpen} aria-controls="public-menu" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} onClick={() => setMenuOpen(!menuOpen)}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d={menuOpen ? "M5 5l14 14M5 19L19 5" : "M3 6h18M3 12h18M3 18h18"} /></svg></button>
        </div>
      </div>
      <nav id="public-menu" hidden={!menuOpen} className={styles.mobileNav} aria-label="Navegação móvel">
        {collections.map((collection) => <div className={styles.mobileGroup} key={collection.slug}>
          <a href={collectionUrl(collection.slug)} onClick={() => setMenuOpen(false)}>{collection.name}<span aria-hidden="true">↗</span></a>
          <div>{collection.items.map((item) => <a key={item.slug} href={collectionUrl(collection.slug, item.slug)} onClick={() => setMenuOpen(false)}>{item.name}</a>)}</div>
        </div>)}
        {links.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}<span aria-hidden="true">↗</span></a>)}
        <a href="/minha-conta" onClick={() => setMenuOpen(false)}>Minha conta</a>
        <a href="/login" onClick={() => setMenuOpen(false)}>Entrar</a>
        <a href="/cadastro" onClick={() => setMenuOpen(false)}>Criar minha conta</a>
        <a href="/#orcamento" onClick={() => setMenuOpen(false)}>Solicitar orçamento</a>
      </nav>
    </header>
  );
}
