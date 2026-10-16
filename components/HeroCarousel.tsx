"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Arrow } from "./CommercePresentation";
import styles from "@/app/premium.module.css";

const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(notify: () => void) {
  const query = window.matchMedia(motionQuery);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
}
function subscribeVisibility(notify: () => void) {
  document.addEventListener("visibilitychange", notify);
  return () => document.removeEventListener("visibilitychange", notify);
}
const slides = [
  {
    name: "Uniformes", titleId: "hero-title", eyebrow: "M.A. / Uniformes profissionais",
    title: <>Uniformes que vestem<br /><span>a força da sua marca.</span></>,
    description: "Uniformes profissionais que traduzem a identidade da sua empresa. Produtos personalizados que levam essa identidade mais longe.",
    primary: { label: "Solicitar orçamento", href: "#orcamento" },
    secondary: { label: "Conhecer a personalização", href: "#personalize" },
    image: "/herohome-ma.png", width: 1448, height: 1086,
    imageAlt: "Composição de camiseta vinho, polo preta com detalhes dourados, jaqueta e caneca personalizada",
    imageHref: "/colecoes/uniformes", imageLabel: "Conhecer uniformes profissionais",
  },
  {
    name: "Almofadas personalizadas", titleId: "hero-title-almofadas", eyebrow: "M.A. / Almofadas personalizadas",
    title: <>Sua criatividade merece<br /><span>um lugar de destaque.</span></>,
    description: "Transforme suas fotos, frases e momentos especiais em almofadas personalizadas, feitas para surpreender e encantar.",
    primary: { label: "Personalizar minha almofada", href: "/colecoes/personalizados" },
    secondary: { label: "Explorar personalizados", href: "/colecoes/personalizados" },
    image: "/hero_almofadas.png", width: 1513, height: 1039,
    imageAlt: "Almofadas personalizadas em composição ilustrativa",
    imageHref: "/colecoes/personalizados", imageLabel: "Conhecer produtos personalizados",
  },
  {
    name: "Camisetas personalizadas", titleId: "hero-title-camisetas", eyebrow: "M.A. / Camisetas personalizadas",
    title: <>Sua ideia, sua camiseta,<br /><span>seu estilo.</span></>,
    description: "Personalize camisetas com suas fotos, frases e artes favoritas. Crie peças exclusivas para presentear, celebrar ou expressar sua personalidade.",
    primary: { label: "Personalizar camiseta", href: "/colecoes/personalizados/camisetas" },
    secondary: { label: "Ver personalizados", href: "/colecoes/personalizados" },
    image: "/hero-camiseta.png", width: 1513, height: 1039, preserveImageContent: true,
    imageAlt: "Camiseta branca com indicação de estampa e arte sobre camisetas personalizadas",
    imageHref: "/colecoes/personalizados/camisetas", imageLabel: "Conhecer camisetas personalizadas",
  },
  {
    name: "Canecas personalizadas", titleId: "hero-title-canecas", eyebrow: "M.A. / Canecas personalizadas",
    title: <>Momentos especiais merecem<br /><span>uma caneca única.</span></>,
    description: "Transforme fotos, mensagens e ideias em canecas personalizadas. Um presente cheio de significado para qualquer ocasião.",
    primary: { label: "Personalizar caneca", href: "/colecoes/personalizados/canecas" },
    secondary: { label: "Ver personalizados", href: "/colecoes/personalizados" },
    image: "/hero-caneca.png", width: 1512, height: 1040, preserveImageContent: true,
    imageAlt: "Duas canecas brancas com estampas ilustrativas e título sobre canecas personalizadas",
    imageHref: "/colecoes/personalizados/canecas", imageLabel: "Conhecer canecas personalizadas",
  },
  {
    name: "Azulejos personalizados", titleId: "hero-title-azulejos", eyebrow: "M.A. / Azulejos personalizados",
    title: <>Transforme suas lembranças<br /><span>em arte.</span></>,
    description: "Eternize fotos, mensagens e momentos especiais em azulejos personalizados que dão um toque único à decoração.",
    primary: { label: "Personalizar azulejo", href: "/colecoes/personalizados" },
    secondary: { label: "Ver personalizados", href: "/colecoes/personalizados" },
    image: "/hero-azulejo.png", width: 1513, height: 1039, preserveImageContent: true,
    imageAlt: "Azulejos em suportes com fotografias e mensagens ilustrativas de família e casal",
    imageHref: "/colecoes/personalizados", imageLabel: "Conhecer produtos personalizados",
  },
];

export default function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [running, setRunning] = useState(true);
  const [hovered, setHovered] = useState(false);
  const reducedMotion = useSyncExternalStore(subscribeMotion, () => window.matchMedia(motionQuery).matches, () => true);
  const hidden = useSyncExternalStore(subscribeVisibility, () => document.hidden, () => false);
  const playing = running && !hovered && !reducedMotion && !hidden;

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setActive(index => (index + 1) % slides.length), 6000);
    return () => window.clearInterval(timer);
  }, [playing]);

  function select(index: number) {
    setRunning(false);
    setActive((index + slides.length) % slides.length);
  }
  function pauseInteraction(target: EventTarget) {
    if (!(target instanceof Element) || !target.closest("[data-rotation-control]")) setRunning(false);
  }

  return <section className={styles.heroBand} aria-roledescription="carrossel" aria-label="Destaques M.A. Confecções"
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={event => pauseInteraction(event.target)} onPointerDownCapture={event => pauseInteraction(event.target)}
    onKeyDown={event => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        select(active + (event.key === "ArrowRight" ? 1 : -1));
      }
    }}>
    <div className={styles.heroCarouselViewport}>
      {slides.map((slide, index) => <div key={slide.titleId}
        className={`${styles.container} ${styles.hero} ${styles.heroCarouselSlide}`}
        data-active={active === index} inert={active !== index} aria-hidden={active !== index}
        role="group" aria-roledescription="slide" aria-label={`${index + 1} de ${slides.length}: ${slide.name}`}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>{slide.eyebrow}</span>
          <h1 id={slide.titleId}>{slide.title}</h1>
          <p>{slide.description}</p>
          <div className={styles.actions}>
            <a className={styles.button} href={slide.primary.href}>{slide.primary.label} <Arrow /></a>
            <a className={styles.secondaryButton} href={slide.secondary.href}>{slide.secondary.label} <Arrow /></a>
          </div>
        </div>
        <figure className={slide.image === "/hero_almofadas.png" || slide.preserveImageContent ? `${styles.heroMedia} ${styles.heroPillowsMedia}` : styles.heroMedia}>
          <a href={slide.imageHref} aria-label={slide.imageLabel}>
            <img className={slide.preserveImageContent ? styles.heroFullArtworkImage : undefined} src={slide.image} alt={slide.imageAlt} width={slide.width} height={slide.height} fetchPriority={index === 0 ? "high" : "low"} />
          </a>
        </figure>
      </div>)}
    </div>
    <div className={styles.heroCarouselControls} role="group" aria-label="Controles dos destaques">
      <button type="button" className={styles.heroCarouselArrow} aria-label="Slide anterior" onClick={() => select(active - 1)}><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m14 6-6 6 6 6" /></svg></button>
      {slides.map((slide, index) => <button key={slide.titleId} type="button" className={styles.heroCarouselDot}
        aria-label={`Mostrar slide ${index + 1}: ${slide.name}`} aria-current={active === index ? "true" : undefined}
        onClick={() => select(index)}><span /></button>)}
      <button type="button" className={styles.heroCarouselArrow} aria-label="Próximo slide" onClick={() => select(active + 1)}><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m10 6 6 6-6 6" /></svg></button>
      {!reducedMotion && <button type="button" data-rotation-control className={styles.heroCarouselRotation}
        aria-label={running ? "Pausar troca automática" : "Retomar troca automática"} onClick={() => setRunning(value => !value)}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">{running ? <path d="M9 5v14M15 5v14" /> : <path d="m8 5 11 7-11 7z" />}</svg>
      </button>}
    </div>
    <span className={styles.heroCarouselStatus} role="status" aria-live={playing ? "off" : "polite"} aria-atomic="true">Slide {active + 1} de {slides.length}: {slides[active].name}</span>
  </section>;
}
