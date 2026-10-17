"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Arrow } from "./CommercePresentation";
import { bannerHref, type Banner } from "@/lib/home/banners";
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
export default function HeroCarousel({ banners }: { banners: Banner[] }) {
  const slides = banners.filter(b=>b.active).sort((a,b)=>a.order-b.order);
  const [active, setActive] = useState(0);
  const [running, setRunning] = useState(true);
  const [hovered, setHovered] = useState(false);
  const reducedMotion = useSyncExternalStore(subscribeMotion, () => window.matchMedia(motionQuery).matches, () => true);
  const hidden = useSyncExternalStore(subscribeVisibility, () => document.hidden, () => false);
  const current = Math.min(active, Math.max(0, slides.length - 1));
  const playing = running && !hovered && !reducedMotion && !hidden;

  useEffect(() => {
    if (!playing || slides.length < 2) return;
    const timer = window.setInterval(() => setActive(index => (index + 1) % slides.length), 6000);
    return () => window.clearInterval(timer);
  }, [playing, slides.length]);

  function select(index: number) {
    setRunning(false);
    setActive((index + slides.length) % slides.length);
  }
  function pauseInteraction(target: EventTarget) {
    if (!(target instanceof Element) || !target.closest("[data-rotation-control]")) setRunning(false);
  }

  if (!slides.length) return null;
  return <section className={styles.heroBand} aria-roledescription="carrossel" aria-label="Destaques M.A. Confecções"
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={event => pauseInteraction(event.target)} onPointerDownCapture={event => pauseInteraction(event.target)}
    onKeyDown={event => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        select(current + (event.key === "ArrowRight" ? 1 : -1));
      }
    }}>
    <div className={styles.heroCarouselViewport}>
      {slides.map((slide, index) => <div key={slide.id}
        className={`${styles.container} ${styles.hero} ${styles.heroCarouselSlide}`}
        data-active={current === index} inert={current !== index} aria-hidden={current !== index}
        role="group" aria-roledescription="slide" aria-label={`${index + 1} de ${slides.length}: ${slide.name}`}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>{`M.A. / ${slide.name}`}</span>
          <h1 id={`hero-${slide.id}`} style={{color:slide.color1||undefined}}>{slide.title1}<br /><span style={{color:slide.color2||undefined}}>{slide.title2}</span></h1>
          <p style={{color:slide.descriptionColor||undefined}}>{slide.description}</p>
          <div className={styles.actions}>
            <a className={styles.button} href={bannerHref(slide)} target={slide.destination === "WHATSAPP" || slide.destination === "EXTERNAL" ? "_blank" : undefined} rel={slide.destination === "WHATSAPP" || slide.destination === "EXTERNAL" ? "noopener noreferrer" : undefined}>{slide.button} <Arrow /></a>
          </div>
        </div>
        <figure className={slide.image !== "/herohome-ma.png" ? `${styles.heroMedia} ${styles.heroPillowsMedia}` : styles.heroMedia}>
          <div className={styles.heroBannerImage}>
            <img className={styles.heroFullArtworkImage} src={slide.image} alt={slide.name} width={1513} height={1039} fetchPriority={index === 0 ? "high" : "low"} />
          </div>
        </figure>
      </div>)}
    </div>
    {slides.length > 1 && <div className={styles.heroCarouselControls} role="group" aria-label="Controles dos destaques">
      <button type="button" className={styles.heroCarouselArrow} aria-label="Slide anterior" onClick={() => select(active - 1)}><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m14 6-6 6 6 6" /></svg></button>
      {slides.map((slide, index) => <button key={slide.id} type="button" className={styles.heroCarouselDot}
        aria-label={`Mostrar slide ${index + 1}: ${slide.name}`} aria-current={active === index ? "true" : undefined}
        onClick={() => select(index)}><span /></button>)}
      <button type="button" className={styles.heroCarouselArrow} aria-label="Próximo slide" onClick={() => select(active + 1)}><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m10 6 6 6-6 6" /></svg></button>
      {!reducedMotion && <button type="button" data-rotation-control className={styles.heroCarouselRotation}
        aria-label={running ? "Pausar troca automática" : "Retomar troca automática"} onClick={() => setRunning(value => !value)}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">{running ? <path d="M9 5v14M15 5v14" /> : <path d="m8 5 11 7-11 7z" />}</svg>
      </button>}
    </div>}
    <span className={styles.heroCarouselStatus} role="status" aria-live={playing ? "off" : "polite"} aria-atomic="true">Slide {current + 1} de {slides.length}: {slides[current].name}</span>
  </section>;
}
