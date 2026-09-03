"use client";

import { useEffect, useState, type ReactNode } from "react";

const slides = [
  {
    kicker: "M.A Confecções & Brindes",
    title: "Presentes, produtos e ideias",
    accent: "que viram memória.",
    text: "Uma nova experiência de compra para personalizados, pronta entrega, confecções e soluções digitais da M.A.",
    image: "/ma-SITE-BRINDES.png",
    primary: "#mais-vendidos",
    primaryLabel: "Explorar produtos",
    secondary: "#personalizados",
    secondaryLabel: "Personalize do seu jeito",
  },
  {
    kicker: "Personalização com propósito",
    title: "Sua ideia merece",
    accent: "um acabamento especial.",
    text: "Escolha modelos prontos, personalize por template ou envie sua própria arte para criar algo realmente único.",
    image: "/MA-SITE-CONFECCOES.png",
    primary: "#categorias",
    primaryLabel: "Ver categorias",
    secondary: "#orcamento",
    secondaryLabel: "Solicitar orçamento",
  },
  {
    kicker: "Tecnologia M.A.",
    title: "Produto físico e experiência",
    accent: "no mesmo presente.",
    text: "Conheça o MA System e os produtos com experiências digitais por QR Code que estamos preparando para a loja.",
    image: "/MA-SITE-BEBES.png",
    primary: "https://app.maconfeccoes.com.br",
    primaryLabel: "Conhecer MA System",
    secondary: "#qr-code",
    secondaryLabel: "Produtos com QR Code",
  },
];

const categories = [
  ["Camisetas", "Modelos prontos e personalizados.", "/MA-SITE-CONFECCOES.png"],
  ["Canecas", "Arte pronta, foto, texto e presentes.", "/ma-SITE-BRINDES.png"],
  ["Azulejos", "Personalizados e experiências com QR Code.", "/ma-SITE-BRINDES.png"],
  ["Brindes", "Produtos para presentear e divulgar marcas.", "/ma-SITE-BRINDES.png"],
  ["Uniformes escolares", "Projetos sob orçamento.", "/MA-SITE-CONFECCOES.png"],
  ["Uniformes empresariais", "Soluções profissionais sob medida.", "/MA-SITE-CONFECCOES.png"],
  ["Linha Baby", "Produtos especiais para cada fase.", "/MA-SITE-BEBES.png"],
  ["Linha Pet", "Personalizados para quem faz parte da família.", "/ma-SITE-BRINDES.png"],
];

function WhatsAppIcon({ size = 18, white = false }: { size?: number; white?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M16.004 3C8.822 3 3 8.67 3 15.666C3 18.342 3.856 20.914 5.442 23.052L4 29L10.2 27.596C12.21 28.64 14.48 29.2 16.004 29.2C23.186 29.2 29 23.53 29 16.534C29 9.538 23.186 3 16.004 3Z" fill={white ? "white" : "#25D366"} />
      <path d="M23.03 19.58C22.75 19.44 21.38 18.77 21.13 18.68C20.88 18.58 20.7 18.54 20.52 18.82C20.34 19.09 19.83 19.68 19.68 19.85C19.53 20.02 19.38 20.04 19.1 19.9C18.82 19.76 17.93 19.47 16.87 18.54C16.05 17.82 15.5 16.93 15.34 16.65C15.19 16.38 15.32 16.23 15.45 16.1C15.57 15.99 15.73 15.81 15.87 15.64C16.01 15.47 16.05 15.35 16.14 15.17C16.23 14.99 16.19 14.84 16.12 14.7C16.05 14.56 15.49 13.2 15.25 12.64C15.01 12.1 14.77 12.18 14.59 12.17C14.42 12.16 14.23 12.16 14.05 12.16C13.87 12.16 13.58 12.23 13.34 12.49C13.11 12.76 12.44 13.38 12.44 14.65C12.44 15.91 13.37 17.14 13.5 17.31C13.64 17.48 15.31 20.11 17.87 21.19C20.43 22.28 20.43 21.91 21.14 21.85C21.85 21.79 23.39 21.2 23.69 20.34C23.98 19.48 23.98 18.76 23.9 18.64C23.81 18.52 23.63 18.47 23.35 18.33" fill={white ? "#25D366" : "white"} />
    </svg>
  );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
}

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const slide = slides[activeSlide];

  const whatsappUrl = "https://wa.me/5511947944345";
  const instagramUrl = "https://www.instagram.com/maconfeccoesebrindes";
  const facebookUrl = "https://www.facebook.com/search/top?q=MA%20Confec%C3%A7%C3%B5es%20e%20Brindes";

  useEffect(() => {
    const timer = window.setInterval(
      () => setActiveSlide((current) => (current + 1) % slides.length),
      6500,
    );
    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="site">
      <section className="hero" id="topo">
        <div className="hero-shell">
          <div className="hero-copy">
            <div className="kicker"><span />{slide.kicker}</div>
            <h1>{slide.title}<br /><em>{slide.accent}</em></h1>
            <p>{slide.text}</p>
            <div className="hero-actions">
              <a href={slide.primary} className="btn primary" target={slide.primary.startsWith("http") ? "_blank" : undefined} rel={slide.primary.startsWith("http") ? "noopener noreferrer" : undefined}>
                {slide.primaryLabel} <span>→</span>
              </a>
              <a href={slide.secondary} className="btn secondary">{slide.secondaryLabel}</a>
            </div>
            <div className="hero-trust">
              <span>Compra segura</span><i /><span>Personalização</span><i /><span>Atendimento M.A.</span>
            </div>
          </div>

          <div className="hero-media">
            <div className="glow" />
            <div className="hero-image">
              <img src={slide.image} alt="" />
              <div className="image-overlay" />
              <div className="image-number">
                <span>EXPERIÊNCIA M.A.</span>
                <strong>{String(activeSlide + 1).padStart(2, "0")}</strong>
              </div>
            </div>
            <div className="float-note top"><strong>feito para você</strong><span>personalização com identidade</span></div>
            <div className="float-note bottom"><strong>novo e exclusivo</strong><span>produto + experiência digital</span></div>
          </div>
        </div>

        <div className="carousel-controls">
          <button onClick={() => setActiveSlide((activeSlide - 1 + slides.length) % slides.length)}>←</button>
          <div>
            {slides.map((_, index) => (
              <button key={index} className={activeSlide === index ? "dot active" : "dot"} onClick={() => setActiveSlide(index)} aria-label={`Slide ${index + 1}`} />
            ))}
          </div>
          <button onClick={() => setActiveSlide((activeSlide + 1) % slides.length)}>→</button>
        </div>
      </section>

      <section className="benefits">
        <div><b>✦</b><span><strong>Personalização flexível</strong><small>Pronto, template ou arte própria.</small></span></div>
        <div><b>⌁</b><span><strong>Produção acompanhada</strong><small>Status e comunicação dentro do pedido.</small></span></div>
        <div><b>◇</b><span><strong>Produtos com propósito</strong><small>Presentes, marcas e experiências.</small></span></div>
        <div><b>✓</b><span><strong>Compra segura</strong><small>Pagamento e acompanhamento digital.</small></span></div>
      </section>

      <section className="section" id="mais-vendidos">
        <div className="section-head">
          <div><span className="eyebrow">Seleção M.A.</span><h2>Mais vendidos</h2></div>
          <a href="#loja" className="text-link">Ver loja completa →</a>
        </div>

        <div className="product-grid">
          {[
            ["Canecas personalizadas", "Presentes personalizados", "Escolha um modelo pronto ou crie a sua própria versão.", "/ma-SITE-BRINDES.png", "Personalizável", "#personalizados"],
            ["Camisetas", "Confecções", "Estampas prontas, templates e personalização avançada.", "/MA-SITE-CONFECCOES.png", "Destaque", "#categorias"],
            ["Azulejos com QR Code", "Experiência digital", "Um presente físico que pode abrir vídeo, áudio, fotos e mensagens.", "/ma-SITE-BRINDES.png", "QR Code", "#qr-code"],
            ["MA System Baby", "MA System", "Memórias, fotos, saúde e momentos especiais em um só lugar.", "/MA-SITE-BEBES.png", "Digital", "https://app.maconfeccoes.com.br"],
          ].map(([title, category, text, image, tag, href]) => (
            <article className="product-card" key={title}>
              <div className="product-image"><img src={image} alt={title} /><span>{tag}</span></div>
              <div className="product-body">
                <small>{category}</small>
                <h3>{title}</h3>
                <p>{text}</p>
                <div><span>Em breve na loja</span><a href={href}>Conhecer →</a></div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="categories-wrap" id="categorias">
        <div className="section">
          <div className="section-head">
            <div><span className="eyebrow">Encontre seu estilo</span><h2>Compre por categoria</h2></div>
            <p>Um catálogo organizado para encontrar rápido o que você quer comprar, personalizar ou solicitar por orçamento.</p>
          </div>

          <div className="category-grid">
            {categories.map(([title, text, image], index) => (
              <a href="#loja" className="category-card" key={title}>
                <img src={image} alt={title} />
                <div className="category-overlay" />
                <div className="category-copy">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <strong>Explorar →</strong>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="personal" id="personalizados">
        <div className="personal-copy">
          <span className="eyebrow light">Personalize do seu jeito</span>
          <h2>De um modelo pronto<br /><em>à sua própria arte.</em></h2>
          <p>Cada produto poderá indicar o tipo de personalização disponível: pronto para comprar, template preparado pela M.A. ou personalização avançada com envio de arquivo após a compra.</p>
          <div className="options">
            <div><b>01</b><span>Sem personalização</span></div>
            <div><b>02</b><span>Template M.A.</span></div>
            <div><b>03</b><span>Personalização avançada</span></div>
          </div>
          <a href="#loja">Conhecer personalizados →</a>
        </div>

        <div className="personal-visual">
          <img src="/ma-SITE-BRINDES.png" alt="Personalizados M.A." className="main-img" />
          <img src="/MA-SITE-CONFECCOES.png" alt="Confecções M.A." className="small-img" />
          <div className="stamp">M.A.<small>FEITO PARA MARCAR</small></div>
        </div>
      </section>

      <section className="section" id="qr-code">
        <div className="qr-card">
          <div className="qr-art">
            <div className="fake-qr">
              {Array.from({ length: 81 }).map((_, index) => <i key={index} className={(index * 7 + index % 5) % 3 === 0 ? "on" : ""} />)}
            </div>
          </div>
          <div className="qr-copy">
            <span className="eyebrow">Experiência QR M.A.</span>
            <h2>Um presente que<br /><em>continua depois de aberto.</em></h2>
            <p>Produtos selecionados poderão levar um QR Code que abre uma página especial da M.A. com vídeos, áudios, fotos e mensagens.</p>
            <div className="tags"><span>Vídeo</span><span>Áudio</span><span>Fotos</span><span>Mensagem</span><span>PIN opcional</span></div>
            <a href="#loja" className="btn primary">Ver produtos com QR Code →</a>
          </div>
        </div>
      </section>

      <section className="section paths" id="loja">
        <div className="section-head"><div><span className="eyebrow">Explore a M.A.</span><h2>Mais caminhos para comprar</h2></div></div>
        <div className="path-grid">
          <a href="#loja" className="path wine" id="ofertas"><span>OFERTAS</span><h3>Achados especiais com condições especiais.</h3><b>Ver ofertas →</b></a>
          <a href="#loja" className="path light-path" id="pronta-entrega"><span>PRONTA ENTREGA</span><h3>Produtos selecionados para quem não quer esperar.</h3><b>Ver pronta entrega →</b></a>
          <a href="#orcamento" className="path dark" id="uniformes"><span>UNIFORMES</span><h3>Escolares e empresariais sob orçamento.</h3><b>Solicitar orçamento →</b></a>
        </div>
      </section>

      <section className="system-section">
        <div className="system-inner">
          <div className="system-image"><img src="/MA-SITE-BEBES.png" alt="MA System Baby" /></div>
          <div className="system-copy">
            <span className="eyebrow">Ecossistema M.A.</span>
            <h2>Tecnologia também<br /><em>faz parte da nossa marca.</em></h2>
            <p>O MA System integra experiências digitais à M.A., começando pelo universo Baby e evoluindo para novas soluções conectadas.</p>
            <div className="system-points"><span>Memórias</span><span>Organização</span><span>Compartilhamento</span></div>
            <a href="https://app.maconfeccoes.com.br" className="btn primary" target="_blank" rel="noopener noreferrer">Acessar MA System →</a>
          </div>
        </div>
      </section>

      <section className="quote" id="orcamento">
        <div>
          <span className="eyebrow light">Projetos especiais</span>
          <h2>Precisa de uniformes ou uma produção sob medida?</h2>
          <p>Escolares, empresariais e projetos especiais terão um fluxo próprio de orçamento, com histórico e acompanhamento.</p>
        </div>
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"><WhatsAppIcon size={22} white /><span><small>Enquanto o formulário fica pronto</small>Falar com a M.A.</span></a>
      </section>

      <section className="newsletter" id="newsletter">
        <div>
          <span className="eyebrow">Clube M.A.</span>
          <h2>Ganhe 10% na sua primeira compra.</h2>
          <p>Cadastre seu e-mail para receber novidades, lançamentos e seu cupom.</p>
        </div>
        <form onSubmit={(e) => e.preventDefault()}><input type="email" placeholder="Seu melhor e-mail" /><button>Quero meu cupom</button></form>
      </section>

      <footer className="footer" id="conta">
        <div className="footer-top">
          <div className="footer-brand"><img src="/logo-ma.jpg" alt="M.A Confecções e Brindes" /><p>Produtos personalizados, confecções, presentes e tecnologia criados para marcar presença.</p></div>
          <div><strong>Loja</strong><a href="#mais-vendidos">Mais vendidos</a><a href="#categorias">Categorias</a><a href="#personalizados">Personalizados</a><a href="#pronta-entrega">Pronta entrega</a></div>
          <div><strong>Atendimento</strong><a href="#orcamento">Orçamento</a><a href="#conta">Minha conta</a><a href="#conta">Meus pedidos</a><a href="#conta">Rastreamento</a></div>
          <div><strong>M.A. Digital</strong><a href="https://app.maconfeccoes.com.br">MA System</a><a href="#qr-code">Experiência QR</a><a href="#newsletter">Newsletter</a></div>
        </div>
        <div className="footer-bottom">
          <div><strong>M.A Confecções e Brindes</strong><span>CNPJ 57.739.176/0001-87</span></div>
          <div className="social"><FooterLink href={whatsappUrl}>WhatsApp</FooterLink><FooterLink href={instagramUrl}>Instagram</FooterLink><FooterLink href={facebookUrl}>Facebook</FooterLink></div>
        </div>
        <div className="copyright">© 2026 M.A Confecções e Brindes <span>◆</span> Todos os direitos reservados</div>
      </footer>

      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="whatsapp" aria-label="Falar pelo WhatsApp"><WhatsAppIcon size={31} white /></a>

      <style>{`
        *{box-sizing:border-box} html{scroll-behavior:smooth} body{margin:0}
        button,input{font:inherit}
        .site{--wine:#6f1738;--gold:#bd8d4f;--ink:#30272a;--muted:#786d69;width:100%;min-height:100vh;overflow-x:hidden;color:var(--ink);background:#fbf9f6;font-family:Arial,Helvetica,sans-serif}
        .announcement{min-height:34px;padding:7px 20px;display:flex;align-items:center;justify-content:center;gap:13px;color:#eadde1;background:#261a1f;font-size:10px}.announcement i{color:#c99a57;font-size:5px}.announcement a{color:#e1b873;text-decoration:none;font-weight:800}
        .header{position:sticky;top:0;z-index:100;background:rgba(255,255,255,.96);border-bottom:1px solid rgba(70,40,48,.08);backdrop-filter:blur(16px);box-shadow:0 8px 30px rgba(55,37,42,.035)}
        .header-main{max-width:1280px;min-height:82px;margin:auto;padding:10px 24px;display:grid;grid-template-columns:210px minmax(260px,1fr) auto;align-items:center;gap:26px}.logo{width:186px;max-width:100%;display:block}.logo-link{display:inline-flex}
        .search{height:46px;border:1px solid rgba(74,51,56,.12);border-radius:999px;background:#f8f5f2;display:flex;align-items:center;overflow:hidden}.search>span{margin-left:16px;color:#8f7d78;font-size:24px}.search input{min-width:0;flex:1;height:100%;padding:0 12px;border:0;outline:0;background:transparent;font-size:12px}.search button{height:36px;margin-right:5px;padding:0 18px;border:0;border-radius:999px;color:white;background:var(--wine);font-size:10px;font-weight:800;cursor:pointer}
        .utilities{display:flex;align-items:center;gap:18px}.utilities>a{display:flex;align-items:center;gap:7px;color:#4c3f43;text-decoration:none;font-size:18px}.utilities>a>span{font-size:10px;font-weight:800}.utilities small{display:block;color:#9b8e8a;font-size:8px;font-weight:500}.cart{position:relative;width:42px;height:42px;border-radius:50%;display:grid!important;place-items:center;color:white!important;background:linear-gradient(135deg,#651734,#8a2f4f)}.cart b{position:absolute;top:-5px;right:-5px;width:18px;height:18px;border:2px solid white;border-radius:50%;display:grid;place-items:center;background:#c49250;font-size:8px}
        .menu-button{display:none;width:42px;height:42px;padding:10px;border:0;border-radius:12px;background:#f5efeb}.menu-button span{height:2px;margin:4px 0;display:block;background:var(--wine)}
        .nav{min-height:46px;padding:0 24px;border-top:1px solid rgba(74,51,56,.06);display:flex;align-items:center;justify-content:center;gap:clamp(17px,2.2vw,34px)}.nav a{padding:15px 0 13px;color:#55484b;text-decoration:none;font-size:9.5px;font-weight:800;letter-spacing:.45px;text-transform:uppercase}.nav .sale{color:var(--wine)}
        .hero{position:relative;overflow:hidden;background:radial-gradient(circle at 75% 25%,rgba(210,170,103,.22),transparent 30%),radial-gradient(circle at 0 90%,rgba(111,23,56,.09),transparent 27%),linear-gradient(135deg,#fbf8f4,#f4ece6 56%,#fbfaf8)}
        .hero-shell{max-width:1280px;min-height:620px;margin:auto;padding:66px 24px 58px;display:grid;grid-template-columns:.9fr 1.1fr;align-items:center;gap:72px}.kicker{display:flex;align-items:center;gap:12px;color:#9b7240;font-size:9px;font-weight:900;letter-spacing:2px;text-transform:uppercase}.kicker span{width:42px;height:1px;background:#b88a4a}
        .hero h1{max-width:650px;margin:18px 0 0;font-family:Georgia,"Times New Roman",serif;font-size:clamp(51px,5.6vw,76px);font-weight:400;line-height:.98;letter-spacing:-2.4px}.hero h1 em,.section h2 em,.personal h2 em,.system-copy h2 em,.qr-copy h2 em{color:var(--wine);font-weight:400}.hero-copy>p{max-width:550px;margin:25px 0 0;color:#746966;font-size:14px;line-height:1.8}
        .hero-actions{margin-top:30px;display:flex;gap:11px;flex-wrap:wrap}.btn{min-height:48px;padding:0 21px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;gap:9px;text-decoration:none;font-size:10px;font-weight:900}.primary{color:white;background:linear-gradient(135deg,#641734,#8a2f4f);box-shadow:0 13px 28px rgba(104,23,53,.18)}.primary span{color:#e4bc77}.secondary{border:1px solid rgba(111,23,56,.18);color:var(--wine);background:rgba(255,255,255,.7)}
        .hero-trust{margin-top:31px;display:flex;align-items:center;gap:10px;color:#8e807b;font-size:8.5px;font-weight:800;text-transform:uppercase}.hero-trust i{width:3px;height:3px;background:#b88949;transform:rotate(45deg)}
        .hero-media{position:relative;height:505px}.glow{position:absolute;width:440px;height:440px;left:50%;top:8px;transform:translateX(-50%);border-radius:50%;background:radial-gradient(circle,rgba(211,169,99,.3),rgba(211,169,99,.06) 58%,transparent 72%)}.hero-image{position:absolute;width:min(540px,88%);aspect-ratio:1.16/1;left:50%;top:38px;transform:translateX(-50%);overflow:hidden;border:1px solid rgba(166,120,68,.25);border-radius:28px;background:white;box-shadow:0 28px 70px rgba(58,37,43,.17)}.hero-image img{width:100%;height:100%;object-fit:cover}.image-overlay{position:absolute;inset:0;background:linear-gradient(180deg,transparent 62%,rgba(41,26,31,.44))}.image-number{position:absolute;left:22px;right:22px;bottom:18px;display:flex;align-items:flex-end;justify-content:space-between;color:white}.image-number span{font-size:8px;font-weight:900;letter-spacing:1.6px}.image-number strong{color:#e5c18a;font-family:Georgia,serif;font-size:24px;font-weight:400}
        .float-note{position:absolute;z-index:5;width:188px;padding:13px 14px;border:1px solid rgba(145,104,58,.18);border-radius:14px;display:flex;flex-direction:column;gap:4px;background:rgba(255,255,255,.92);box-shadow:0 14px 35px rgba(57,38,43,.1)}.float-note strong{color:var(--wine);font-family:Georgia,serif;font-size:13px;font-weight:400}.float-note span{color:#867874;font-size:8.5px}.float-note.top{top:10px;right:0}.float-note.bottom{left:2px;bottom:18px}
        .carousel-controls{width:fit-content;margin:-34px auto 24px;padding:7px 9px;border:1px solid rgba(103,67,73,.1);border-radius:999px;display:flex;align-items:center;gap:11px;background:rgba(255,255,255,.85)}.carousel-controls>button{width:32px;height:32px;border:0;border-radius:50%;background:transparent}.carousel-controls>div{display:flex;gap:6px}.carousel-controls .dot{width:7px;height:7px;padding:0;border:0;border-radius:999px;background:#d8ccc6}.carousel-controls .dot.active{width:24px;background:var(--wine)}
        .benefits{max-width:1280px;min-height:88px;margin:auto;padding:16px 24px;display:grid;grid-template-columns:repeat(4,1fr);background:white}.benefits>div{padding:0 22px;border-right:1px solid rgba(118,79,70,.11);display:flex;align-items:center;gap:12px}.benefits>div:last-child{border:0}.benefits b{width:35px;height:35px;border:1px solid rgba(176,127,65,.22);border-radius:50%;display:grid;place-items:center;color:#aa7c43;background:#fbf7f1}.benefits strong,.benefits small{display:block}.benefits strong{font-size:9.5px}.benefits small{margin-top:3px;color:#9b8f8b;font-size:8.5px}
        .section{max-width:1280px;margin:auto;padding:92px 24px}.section-head{margin-bottom:32px;display:flex;align-items:flex-end;justify-content:space-between;gap:30px}.section-head>p{max-width:440px;margin:0;color:#817571;font-size:12px;line-height:1.7}.eyebrow{color:#a47a43;font-size:8.5px;font-weight:900;letter-spacing:1.8px;text-transform:uppercase}.eyebrow.light{color:#d5aa66}.section h2,.personal h2,.system-copy h2,.qr-copy h2,.quote h2,.newsletter h2{margin:8px 0 0;font-family:Georgia,serif;font-size:clamp(35px,4.1vw,49px);font-weight:400;line-height:1.04;letter-spacing:-1.2px}.text-link{color:var(--wine);text-decoration:none;font-size:9.5px;font-weight:900;text-transform:uppercase}
        .product-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:17px}.product-card{overflow:hidden;border:1px solid rgba(108,75,68,.12);border-radius:19px;background:white;box-shadow:0 14px 35px rgba(52,36,40,.055)}.product-image{position:relative;aspect-ratio:1/.83;overflow:hidden}.product-image img{width:100%;height:100%;object-fit:cover}.product-image span{position:absolute;top:12px;left:12px;padding:6px 9px;border-radius:999px;color:#6f562d;background:rgba(255,248,234,.93);font-size:7.5px;font-weight:900;text-transform:uppercase}.product-body{min-height:210px;padding:19px 18px 17px;display:flex;flex-direction:column}.product-body>small{color:#a17b4a;font-size:7.5px;font-weight:900;text-transform:uppercase}.product-body h3{margin:7px 0 0;font-family:Georgia,serif;font-size:21px;font-weight:400}.product-body p{margin:9px 0;color:#817570;font-size:11px;line-height:1.65}.product-body>div{margin-top:auto;padding-top:18px;border-top:1px solid rgba(97,66,60,.08);display:flex;justify-content:space-between;gap:10px}.product-body>div span{color:#978984;font-size:7.8px;font-weight:800;text-transform:uppercase}.product-body a{color:var(--wine);text-decoration:none;font-size:8px;font-weight:900}
        .categories-wrap{background:#f4eee9}.category-grid{display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:242px;gap:14px}.category-card{position:relative;overflow:hidden;border-radius:19px;color:white;text-decoration:none;background:#3a2830}.category-card img{width:100%;height:100%;object-fit:cover}.category-overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(30,19,23,.08),rgba(30,19,23,.74))}.category-copy{position:absolute;left:18px;right:18px;bottom:17px}.category-copy>span{color:#e6c286;font-family:Georgia,serif;font-size:9px}.category-copy h3{margin:5px 0;font-family:Georgia,serif;font-size:22px;font-weight:400}.category-copy p{margin:7px 0;color:#e5dadd;font-size:9px}.category-copy strong{color:#f2d39c;font-size:8px;text-transform:uppercase}
        .personal{min-height:650px;display:grid;grid-template-columns:1fr 1fr;color:white;background:radial-gradient(circle at 20% 10%,rgba(132,50,78,.4),transparent 28%),linear-gradient(135deg,#281a20,#3b202b);overflow:hidden}.personal-copy{max-width:640px;margin-left:auto;padding:92px 64px 92px 24px;align-self:center}.personal h2{color:white;font-size:clamp(42px,4.8vw,58px)}.personal h2 em{color:#ddb477}.personal-copy>p{max-width:560px;margin:21px 0;color:#d5c7cb;font-size:12.5px;line-height:1.78}.options{margin-top:28px;border-top:1px solid rgba(222,181,116,.16);border-bottom:1px solid rgba(222,181,116,.16);display:grid;grid-template-columns:repeat(3,1fr)}.options div{padding:17px 14px;border-right:1px solid rgba(222,181,116,.14)}.options b{display:block;color:#d9ad6b;font-family:Georgia,serif;font-size:10px}.options span{margin-top:5px;display:block;font-size:9px;font-weight:800}.personal-copy>a{margin-top:26px;display:inline-block;color:white;text-decoration:none;font-size:9px;font-weight:900;text-transform:uppercase}
        .personal-visual{position:relative;overflow:hidden}.personal-visual img{position:absolute;object-fit:cover;border:1px solid rgba(226,187,129,.28);box-shadow:0 24px 70px rgba(0,0,0,.22)}.main-img{width:78%;aspect-ratio:1.16/1;left:8%;top:94px;border-radius:28px}.small-img{width:40%;aspect-ratio:4/3;right:4%;bottom:65px;border-radius:18px;transform:rotate(4deg)}.stamp{position:absolute;left:3%;bottom:74px;width:130px;height:130px;border:1px solid rgba(228,188,125,.32);border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#e6c58e;background:rgba(36,23,28,.78);font-family:Georgia,serif;font-size:31px}.stamp small{margin-top:5px;font-family:Arial;font-size:6px}
        .qr-card{min-height:460px;padding:36px;border:1px solid rgba(128,86,74,.12);border-radius:30px;display:grid;grid-template-columns:.85fr 1.15fr;align-items:center;gap:60px;background:radial-gradient(circle at 15% 45%,rgba(213,173,108,.18),transparent 27%),#fff;box-shadow:0 22px 65px rgba(56,39,43,.075)}.qr-art{min-height:360px;display:grid;place-items:center}.fake-qr{width:190px;height:190px;padding:16px;border-radius:24px;display:grid;grid-template-columns:repeat(9,1fr);gap:3px;background:white;box-shadow:0 20px 50px rgba(58,37,43,.16);transform:rotate(-3deg)}.fake-qr i{border-radius:2px}.fake-qr i.on{background:#4b2936}.qr-copy p{max-width:570px;color:#7d706c;font-size:12.5px;line-height:1.75}.tags{margin:24px 0 28px;display:flex;gap:7px;flex-wrap:wrap}.tags span{padding:8px 11px;border:1px solid rgba(114,74,67,.11);border-radius:999px;color:#6c5d59;background:#f8f4f1;font-size:8px;font-weight:800}
        .paths{padding-top:0}.path-grid{display:grid;grid-template-columns:1.1fr .95fr .95fr;gap:15px}.path{min-height:310px;padding:28px;border-radius:23px;display:flex;flex-direction:column;justify-content:flex-end;text-decoration:none}.path>span,.path>b{font-size:8px;font-weight:900;letter-spacing:1.5px}.path h3{max-width:340px;margin:12px 0;font-family:Georgia,serif;font-size:29px;font-weight:400;line-height:1.05}.wine{color:white;background:linear-gradient(135deg,#681735,#8c3151)}.wine>span,.wine>b{color:#eccd97}.light-path{color:#3c3033;background:#efe5dc}.light-path>span,.light-path>b{color:var(--wine)}.dark{color:white;background:#2b2024}.dark>span,.dark>b{color:#d7ad6d}
        .system-section{padding:102px 24px;background:#f1e9e2}.system-inner{max-width:1180px;margin:auto;display:grid;grid-template-columns:1.05fr .95fr;align-items:center;gap:72px}.system-image img{width:100%;display:block;border-radius:27px;box-shadow:0 24px 60px rgba(60,39,44,.13)}.system-copy>p{max-width:470px;color:#796d69;font-size:12.5px;line-height:1.75}.system-points{margin:25px 0 28px;padding:17px 0;border-top:1px solid rgba(113,75,67,.13);border-bottom:1px solid rgba(113,75,67,.13);display:flex;gap:23px}.system-points span{font-size:9px;font-weight:800}
        .quote{min-height:260px;padding:54px max(24px,calc((100vw - 1180px)/2));display:flex;align-items:center;justify-content:space-between;gap:45px;color:white;background:#24181d}.quote h2{max-width:680px;color:white}.quote p{max-width:690px;color:#cbbdc1;font-size:11.5px;line-height:1.7}.quote>a{min-width:238px;min-height:60px;padding:10px 17px;border-radius:17px;display:flex;align-items:center;gap:11px;color:white;text-decoration:none;background:#25d366}.quote>a small{display:block;font-size:7px}.quote>a span{font-size:10px;font-weight:900}
        .newsletter{max-width:1180px;min-height:235px;margin:auto;padding:55px 24px;display:grid;grid-template-columns:1fr .85fr;align-items:center;gap:65px;background:white}.newsletter h2{font-size:clamp(32px,3.6vw,44px)}.newsletter p{color:#817571;font-size:11px}.newsletter form{height:54px;padding:5px;border:1px solid rgba(104,69,61,.13);border-radius:999px;display:flex;background:#f7f3f0}.newsletter input{min-width:0;flex:1;padding:0 17px;border:0;outline:0;background:transparent}.newsletter button{padding:0 20px;border:0;border-radius:999px;color:white;background:var(--wine);font-size:9px;font-weight:900}
        .footer{padding:55px 24px 18px;color:#d9cdd1;background:#1e1619}.footer-top{max-width:1180px;margin:auto;padding-bottom:38px;display:grid;grid-template-columns:1.4fr repeat(3,.7fr);gap:50px;border-bottom:1px solid rgba(255,255,255,.07)}.footer-brand img{width:175px}.footer-brand p{max-width:310px;color:#9e9196;font-size:10px;line-height:1.65}.footer-top>div:not(.footer-brand){display:flex;flex-direction:column;gap:9px}.footer-top strong{font-size:9px;text-transform:uppercase}.footer-top a{color:#9f9296;text-decoration:none;font-size:9.5px}.footer-bottom{max-width:1180px;margin:auto;padding:22px 0;display:flex;justify-content:space-between;gap:25px;flex-wrap:wrap}.footer-bottom>div:first-child{display:flex;flex-direction:column;gap:4px}.footer-bottom strong{font-size:11px}.footer-bottom span{color:#8e8186;font-size:8.5px}.social{display:flex;gap:17px}.social a{color:#c9bcc0;text-decoration:none;font-size:9px}.copyright{max-width:1180px;margin:auto;padding-top:13px;border-top:1px solid rgba(255,255,255,.04);text-align:center;color:#71656a;font-size:8px}.copyright span{padding:0 8px;color:#9b7546;font-size:4px}
        .whatsapp{position:fixed;right:22px;bottom:22px;z-index:9999;width:57px;height:57px;border-radius:50%;display:grid;place-items:center;background:#25d366;box-shadow:0 14px 32px rgba(20,92,46,.24)}
        @media(max-width:980px){.header-main{grid-template-columns:180px 1fr auto}.utilities>a:not(.cart){display:none}.nav{gap:17px}.hero-shell{grid-template-columns:1fr;gap:30px}.hero-copy{text-align:center}.kicker,.hero-actions,.hero-trust{justify-content:center}.hero-copy>p{margin-left:auto;margin-right:auto}.hero-media{width:680px;max-width:100%;margin:auto}.product-grid{grid-template-columns:repeat(2,1fr)}.category-grid{grid-template-columns:repeat(2,1fr)}.personal{grid-template-columns:1fr}.personal-copy{max-width:760px;margin:auto;padding:75px 24px 45px;text-align:center}.personal-copy>p{margin-left:auto;margin-right:auto}.personal-visual{min-height:500px}.qr-card{grid-template-columns:1fr}.path-grid{grid-template-columns:1fr}.system-inner{grid-template-columns:1fr;max-width:750px}.system-copy{text-align:center}.system-copy>p{margin-left:auto;margin-right:auto}.system-points{justify-content:center}.footer-top{grid-template-columns:1.2fr repeat(3,.8fr);gap:25px}}
        @media(max-width:760px){.announcement i,.announcement span:nth-of-type(2){display:none}.header-main{min-height:68px;padding:8px 13px;grid-template-columns:1fr auto auto}.logo{width:135px}.search{display:none}.menu-button{display:block}.nav{display:none}.nav.open{position:absolute;left:0;right:0;padding:14px 22px 22px;display:grid;grid-template-columns:1fr 1fr;gap:0;background:white;box-shadow:0 20px 30px rgba(43,28,33,.09)}.nav a{padding:13px 8px;border-bottom:1px solid rgba(78,52,59,.07)}.hero-shell{min-height:0;padding:44px 16px 30px}.hero h1{font-size:clamp(38px,11vw,48px);letter-spacing:-1.2px}.hero-media{height:350px}.hero-image{width:88%;top:25px;border-radius:18px}.glow{width:290px;height:290px}.float-note{width:145px;padding:9px 10px}.float-note strong{font-size:10px}.float-note span{font-size:7px}.carousel-controls{margin-top:-12px}.benefits{grid-template-columns:1fr 1fr}.benefits>div{min-height:68px}.section{padding:64px 16px}.section-head{align-items:flex-start;flex-direction:column;gap:15px}.section h2,.personal h2,.system-copy h2,.qr-copy h2,.quote h2,.newsletter h2{font-size:clamp(31px,9.5vw,40px)}.product-grid{grid-template-columns:1fr}.category-grid{grid-template-columns:1fr;grid-auto-rows:240px}.personal-copy{padding:62px 16px 40px}.options{grid-template-columns:1fr}.options div{border-right:0;border-bottom:1px solid rgba(222,181,116,.12)}.personal-visual{min-height:390px}.main-img{width:88%;left:6%;top:30px}.small-img{width:42%;bottom:30px}.stamp{width:100px;height:100px;bottom:35px;font-size:25px}.qr-card{padding:24px 16px}.qr-art{min-height:270px}.fake-qr{width:155px;height:155px}.qr-copy{text-align:center}.tags{justify-content:center}.path{min-height:220px}.system-section{padding:72px 16px}.quote{padding:48px 16px;align-items:flex-start;flex-direction:column}.quote>a{width:100%}.newsletter{padding:48px 16px;grid-template-columns:1fr;gap:28px}.newsletter form{height:auto;padding:0;border:0;display:grid;grid-template-columns:1fr;gap:8px;background:transparent}.newsletter input,.newsletter button{min-height:49px;border-radius:999px}.newsletter input{padding:0 17px;background:#f7f3f0}.footer{padding:45px 16px 18px}.footer-top{grid-template-columns:1fr 1fr;gap:28px 18px}.footer-brand{grid-column:1/-1}.footer-bottom{align-items:flex-start;flex-direction:column}.social{flex-wrap:wrap}.whatsapp{width:53px;height:53px;right:15px;bottom:15px}}
        @media(max-width:390px){.announcement a{display:none}.logo{width:122px}.hero h1{font-size:36px}.hero-media{height:315px}.float-note{width:132px}.benefits{grid-template-columns:1fr}.footer-top{grid-template-columns:1fr}.footer-brand{grid-column:auto}}
      `}</style>
    </main>
  );
}
