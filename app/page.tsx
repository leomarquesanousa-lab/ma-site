import type { ReactNode } from "react";

function WhatsAppIcon({
  size = 16,
  white = false,
}: {
  size?: number;
  white?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M16.004 3C8.822 3 3 8.67 3 15.666C3 18.342 3.856 20.914 5.442 23.052L4 29L10.2 27.596C12.21 28.64 14.48 29.2 16.004 29.2C23.186 29.2 29 23.53 29 16.534C29 9.538 23.186 3 16.004 3Z"
        fill={white ? "white" : "#25D366"}
      />

      <path
        d="M23.03 19.58C22.75 19.44 21.38 18.77 21.13 18.68C20.88 18.58 20.7 18.54 20.52 18.82C20.34 19.09 19.83 19.68 19.68 19.85C19.53 20.02 19.38 20.04 19.1 19.9C18.82 19.76 17.93 19.47 16.87 18.54C16.05 17.82 15.5 16.93 15.34 16.65C15.19 16.38 15.32 16.23 15.45 16.1C15.57 15.99 15.73 15.81 15.87 15.64C16.01 15.47 16.05 15.35 16.14 15.17C16.23 14.99 16.19 14.84 16.12 14.7C16.05 14.56 15.49 13.2 15.25 12.64C15.01 12.1 14.77 12.18 14.59 12.17C14.42 12.16 14.23 12.16 14.05 12.16C13.87 12.16 13.58 12.23 13.34 12.49C13.11 12.76 12.44 13.38 12.44 14.65C12.44 15.91 13.37 17.14 13.5 17.31C13.64 17.48 15.31 20.11 17.87 21.19C20.43 22.28 20.43 21.91 21.14 21.85C21.85 21.79 23.39 21.2 23.69 20.34C23.98 19.48 23.98 18.76 23.9 18.64C23.81 18.52 23.63 18.47 23.35 18.33"
        fill={white ? "#25D366" : "white"}
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="4"
        width="24"
        height="24"
        rx="7"
        fill="url(#instagram-gradient)"
      />

      <path
        d="M16 10.2C12.8 10.2 10.2 12.8 10.2 16C10.2 19.2 12.8 21.8 16 21.8C19.2 21.8 21.8 19.2 21.8 16C21.8 12.8 19.2 10.2 16 10.2ZM16 19.8C13.9 19.8 12.2 18.1 12.2 16C12.2 13.9 13.9 12.2 16 12.2C18.1 12.2 19.8 13.9 19.8 16C19.8 18.1 18.1 19.8 16 19.8Z"
        fill="white"
      />

      <circle cx="22.3" cy="9.7" r="1.4" fill="white" />

      <defs>
        <linearGradient
          id="instagram-gradient"
          x1="6"
          y1="26"
          x2="26"
          y2="6"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FEDA75" />
          <stop offset="0.35" stopColor="#FA7E1E" />
          <stop offset="0.65" stopColor="#D62976" />
          <stop offset="1" stopColor="#4F5BD5" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="13" fill="#1877F2" />

      <path
        d="M17.72 25V17.13H20.33L20.72 14.06H17.72V12.1C17.72 11.21 17.97 10.6 19.25 10.6H20.82V7.86C20.06 7.78 19.3 7.74 18.53 7.74C16.26 7.74 14.7 9.12 14.7 11.68V14.06H12.1V17.13H14.7V25H17.72Z"
        fill="white"
      />
    </svg>
  );
}

function FooterLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="footer-link"
    >
      {icon}
      <span>{children}</span>
    </a>
  );
}

function ProductCard({
  eyebrow,
  title,
  description,
  imageSrc,
  imageAlt,
  href,
}: {
  eyebrow: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  href?: string;
}) {
  return (
    <article className="premium-card">
      <div className="premium-card-image">
        <img src={imageSrc} alt={imageAlt} />

        <div className="premium-card-overlay" />
        <div className="gold-detail" />
      </div>

      <div className="premium-card-content">
        <span className="card-eyebrow">{eyebrow}</span>

        <h3>{title}</h3>

        <p>{description}</p>

        <div className="premium-card-bottom">
          {href ? (
            <a href={href} className="card-action">
              Acessar
              <span>→</span>
            </a>
          ) : (
            <span className="coming-soon">Em breve</span>
          )}

          <span className="mini-diamond">◆</span>
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  const whatsappUrl = "https://wa.me/5511947944345";

  const instagramUrl =
    "https://www.instagram.com/maconfeccoesebrindes";

  const facebookUrl =
    "https://www.facebook.com/search/top?q=MA%20Confec%C3%A7%C3%B5es%20e%20Brindes";

  return (
    <main className="site">
      <div className="page-decoration">
        <div className="page-glow glow-gold" />
        <div className="page-glow glow-wine" />
        <div className="large-ring ring-top" />
        <div className="large-ring ring-middle" />
      </div>

      <header className="header">
        <div className="header-inner">
          <img
            src="/logo-ma.jpg"
            alt="M.A Confecções e Brindes"
            className="header-logo"
          />

          <div className="header-actions">
            <span className="header-text">
              Confecções • Brindes • Tecnologia
            </span>

            <a
              href="https://app.maconfeccoes.com.br"
              className="header-button"
            >
              Acessar MA System
              <span>→</span>
            </a>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <div className="hero-kicker">
              <span />
              M.A Confecções & Brindes
            </div>

            <h1>
              Criamos para
              <br />
              <em>marcar presença.</em>
            </h1>

            <p>
              Confecções, produtos personalizados e tecnologia reunidos em uma
              nova experiência digital da M.A.
            </p>

            <div className="hero-buttons">
              <a
                href="https://app.maconfeccoes.com.br"
                className="button-primary"
              >
                Conhecer MA System
                <span>→</span>
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="button-secondary"
              >
                Falar conosco
              </a>
            </div>

            <div className="construction-badge">
              <span className="construction-dot" />

              <div>
                <strong>Novo site em construção</strong>

                <small>
                  Estamos preparando uma experiência completa.
                </small>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-gold-circle" />

            <div className="visual-lines">
              <span />
              <span />
              <span />
            </div>

            <div className="visual-card visual-main">
              <img src="/MA-SITE-BEBES.png" alt="MA System Baby" />
            </div>

            <div className="visual-card visual-left">
              <img
                src="/MA-SITE-CONFECCOES.png"
                alt="Confecções"
              />
            </div>

            <div className="visual-card visual-right">
              <img
                src="/ma-SITE-BRINDES.png"
                alt="Brindes personalizados"
              />
            </div>

            <div className="visual-label">
              <span>M.A</span>

              <small>
                PRODUTOS • EXPERIÊNCIAS • TECNOLOGIA
              </small>
            </div>
          </div>
        </div>
      </section>

      <section className="signature-strip">
        <div className="signature-inner">
          <span>Personalização</span>
          <i />
          <span>Qualidade</span>
          <i />
          <span>Tecnologia</span>
          <i />
          <span>Experiência</span>
        </div>
      </section>

      <section className="showcase">
        <div className="section-heading">
          <div className="heading-number">01</div>

          <div>
            <span className="section-kicker">Nosso universo</span>

            <h2>
              Soluções que unem
              <br />
              <em>marca e experiência.</em>
            </h2>
          </div>

          <p>
            Uma seleção do que já fazemos hoje e das experiências digitais que
            estão chegando ao ecossistema M.A.
          </p>
        </div>

        <div className="cards-grid">
          <ProductCard
            eyebrow="Confecção premium"
            title="Confecções"
            description="Camisas, jaquetas e peças personalizadas para empresas, equipes, eventos e projetos especiais."
            imageSrc="/MA-SITE-CONFECCOES.png"
            imageAlt="Confecções personalizadas"
          />

          <ProductCard
            eyebrow="Sua marca presente"
            title="Brindes personalizados"
            description="Canecas, garrafas e presentes personalizados para empresas, ações promocionais e ocasiões especiais."
            imageSrc="/ma-SITE-BRINDES.png"
            imageAlt="Brindes personalizados"
          />

          <ProductCard
            eyebrow="Tecnologia com propósito"
            title="MA System Baby"
            description="Uma experiência digital criada para guardar memórias e acompanhar os momentos mais importantes da vida do bebê."
            imageSrc="/MA-SITE-BEBES.png"
            imageAlt="MA System Baby"
            href="https://app.maconfeccoes.com.br"
          />
        </div>
      </section>

      <section className="brand-message">
        <div className="brand-message-inner">
          <div className="brand-message-copy">
            <span className="brand-message-kicker">
              M.A Confecções & Brindes
            </span>

            <h2>
              Sua ideia pode virar
              <br />
              <em>algo memorável.</em>
            </h2>

            <p>
              Seja para vestir uma equipe, fortalecer uma marca ou criar um
              presente especial, cada projeto começa com uma ideia e ganha
              forma com cuidado em cada detalhe.
            </p>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="brand-message-link"
            >
              Solicitar orçamento
              <span>→</span>
            </a>
          </div>

          <div className="brand-message-side">
            <div className="message-box">
              <span className="message-number">01</span>

              <strong>Personalização</strong>

              <p>
                Produtos pensados para representar sua marca, empresa ou
                momento especial.
              </p>
            </div>

            <div className="message-box">
              <span className="message-number">02</span>

              <strong>Acabamento</strong>

              <p>
                Atenção à apresentação, identidade visual e qualidade de cada
                projeto.
              </p>
            </div>

            <div className="message-box">
              <span className="message-number">03</span>

              <strong>Soluções digitais</strong>

              <p>
                Tecnologia integrada para ampliar a experiência dos nossos
                produtos e serviços.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="system-highlight">
        <div className="system-highlight-inner">
          <div className="system-image-area">
            <div className="system-frame">
              <img
                src="/MA-SITE-BEBES.png"
                alt="MA System Baby"
              />
            </div>

            <div className="system-decoration system-decoration-one" />
            <div className="system-decoration system-decoration-two" />
          </div>

          <div className="system-copy">
            <span className="section-kicker">MA System</span>

            <h2>
              Tecnologia criada
              <br />
              <em>com propósito.</em>
            </h2>

            <p>
              O MA System nasce para transformar experiências especiais em
              soluções digitais simples, organizadas e bonitas.
            </p>

            <div className="system-features">
              <div>
                <strong>01</strong>
                <span>Organização</span>
              </div>

              <div>
                <strong>02</strong>
                <span>Memórias</span>
              </div>

              <div>
                <strong>03</strong>
                <span>Compartilhamento</span>
              </div>
            </div>

            <a
              href="https://app.maconfeccoes.com.br"
              className="system-link"
            >
              Acessar MA System Baby
              <span>→</span>
            </a>
          </div>
        </div>
      </section>

      <section className="coming-section">
        <div className="coming-decoration coming-one" />
        <div className="coming-decoration coming-two" />

        <div className="coming-inner">
          <span>NOVA EXPERIÊNCIA</span>

          <h2>
            Estamos construindo
            <br />
            <em>o próximo capítulo.</em>
          </h2>

          <p>
            Em breve, uma nova loja virtual, novos produtos e novas soluções
            digitais da M.A.
          </p>

          <div className="coming-divider">
            <i />
            ◆
            <i />
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-gold-line" />

        <div className="footer-inner">
          <div className="footer-company">
            <strong>M.A Confecções e Brindes</strong>

            <span>CNPJ 57.739.176/0001-87</span>
          </div>

          <div className="footer-social">
            <FooterLink
              href={whatsappUrl}
              icon={<WhatsAppIcon />}
            >
              (11) 94794-4345
            </FooterLink>

            <FooterLink
              href={instagramUrl}
              icon={<InstagramIcon />}
            >
              @maconfeccoesebrindes
            </FooterLink>

            <FooterLink
              href={facebookUrl}
              icon={<FacebookIcon />}
            >
              MA Confecções e Brindes
            </FooterLink>
          </div>
        </div>

        <div className="copyright">
          © 2026 M.A Confecções e Brindes
          <span>◆</span>
          Todos os direitos reservados
        </div>
      </footer>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-floating"
        aria-label="Falar pelo WhatsApp"
      >
        <WhatsAppIcon size={32} white />
      </a>

      <style>{`
        * {
          box-sizing: border-box;
        }

        .site {
          width: 100%;
          max-width: 100%;
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          background:
            linear-gradient(
              180deg,
              #fbf8f3 0%,
              #f5eee7 35%,
              #fbfaf7 66%,
              #f0e8e1 100%
            );
          color: #30272a;
          font-family: Arial, Helvetica, sans-serif;
        }

        .page-decoration {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .page-glow {
          position: absolute;
          border-radius: 50%;
        }

        .glow-gold {
          width: 780px;
          height: 780px;
          top: -390px;
          right: -260px;
          background:
            radial-gradient(
              circle,
              rgba(213, 173, 108, 0.22),
              rgba(213, 173, 108, 0.05) 48%,
              transparent 72%
            );
        }

        .glow-wine {
          width: 700px;
          height: 700px;
          top: 780px;
          left: -470px;
          background:
            radial-gradient(
              circle,
              rgba(113, 27, 57, 0.15),
              rgba(113, 27, 57, 0.025) 55%,
              transparent 72%
            );
        }

        .large-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(188, 139, 66, 0.17);
        }

        .ring-top {
          width: 600px;
          height: 600px;
          right: -410px;
          top: 160px;
        }

        .ring-middle {
          width: 800px;
          height: 800px;
          left: -620px;
          top: 950px;
        }

        .header {
          position: sticky;
          top: 0;
          z-index: 100;
          width: 100%;
          background: #ffffff;
          border-bottom: 1px solid #eee7e2;
          box-shadow: 0 5px 20px rgba(62, 43, 48, 0.035);
        }

        .header-inner {
          width: 100%;
          max-width: 1220px;
          min-height: 84px;
          padding: 10px 24px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 22px;
        }

        .header-logo {
          width: 190px;
          max-width: 45vw;
          height: auto;
          display: block;
        }

        .header-actions {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 25px;
        }

        .header-text {
          color: #8e7c73;
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 1.3px;
          text-transform: uppercase;
        }

        .header-button {
          min-height: 42px;
          padding: 0 18px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          gap: 9px;
          color: white;
          text-decoration: none;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
          background:
            linear-gradient(
              135deg,
              #641a35,
              #842d4a
            );
          box-shadow: 0 10px 24px rgba(94, 27, 52, 0.16);
        }

        .header-button span {
          color: #dfb875;
          font-size: 16px;
        }

        .hero {
          position: relative;
          z-index: 1;
          width: 100%;
          padding: 74px 24px 95px;
          overflow: hidden;
        }

        .hero-inner {
          width: 100%;
          max-width: 1220px;
          min-height: 580px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 0.88fr 1.12fr;
          gap: 65px;
          align-items: center;
        }

        .hero-copy {
          min-width: 0;
          position: relative;
          z-index: 4;
        }

        .hero-kicker {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-bottom: 21px;
          color: #a17a45;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .hero-kicker span {
          width: 43px;
          height: 1px;
          flex: 0 0 43px;
          background: #b98a48;
        }

        .hero h1 {
          margin: 0;
          color: #302629;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(53px, 6.4vw, 82px);
          font-weight: 400;
          line-height: 0.98;
          letter-spacing: -2.4px;
        }

        .hero h1 em {
          color: #761c3c;
          font-weight: 400;
        }

        .hero-copy > p {
          max-width: 510px;
          margin: 25px 0 0;
          color: #756966;
          font-size: 15px;
          line-height: 1.8;
        }

        .hero-buttons {
          margin-top: 30px;
          display: flex;
          gap: 11px;
          flex-wrap: wrap;
        }

        .button-primary,
        .button-secondary {
          min-height: 47px;
          padding: 0 20px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          text-decoration: none;
          font-size: 11px;
          font-weight: 800;
        }

        .button-primary {
          color: white;
          background:
            linear-gradient(
              135deg,
              #641a35,
              #882e4b
            );
          box-shadow: 0 12px 28px rgba(102, 28, 55, 0.16);
        }

        .button-primary span {
          color: #dfb775;
          font-size: 16px;
        }

        .button-secondary {
          color: #6f293f;
          background: rgba(255, 255, 255, 0.62);
          border: 1px solid rgba(126, 80, 87, 0.19);
        }

        .construction-badge {
          width: fit-content;
          max-width: 100%;
          margin-top: 38px;
          padding: 10px 15px 10px 12px;
          border-radius: 999px;
          border: 1px solid rgba(169, 126, 72, 0.18);
          background: rgba(255, 255, 255, 0.45);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .construction-dot {
          width: 8px;
          height: 8px;
          flex: 0 0 8px;
          border-radius: 50%;
          background: #b88948;
          box-shadow: 0 0 0 5px rgba(184, 137, 72, 0.10);
        }

        .construction-badge div {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .construction-badge strong {
          color: #493c3d;
          font-size: 9.5px;
        }

        .construction-badge small {
          color: #9a8b87;
          font-size: 9px;
        }

        .hero-visual {
          position: relative;
          min-width: 0;
          width: 100%;
          height: 560px;
        }

        .visual-gold-circle {
          position: absolute;
          width: 445px;
          height: 445px;
          border-radius: 50%;
          top: 22px;
          left: 50%;
          transform: translateX(-50%);
          background:
            radial-gradient(
              circle,
              rgba(225, 190, 129, 0.30),
              rgba(225, 190, 129, 0.08) 55%,
              transparent 70%
            );
          border: 1px solid rgba(191, 144, 70, 0.22);
        }

        .visual-lines {
          position: absolute;
          bottom: 38px;
          right: 0;
          width: 290px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          transform: rotate(-12deg);
          opacity: 0.46;
        }

        .visual-lines span {
          height: 1px;
          background:
            linear-gradient(
              90deg,
              transparent,
              #bb8845,
              transparent
            );
        }

        .visual-card {
          position: absolute;
          overflow: hidden;
          border: 1px solid rgba(174, 128, 69, 0.30);
          background: white;
          box-shadow: 0 22px 48px rgba(54, 36, 40, 0.13);
        }

        .visual-card img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .visual-main {
          width: 430px;
          max-width: 72%;
          aspect-ratio: 4 / 3;
          top: 88px;
          left: 50%;
          z-index: 4;
          border-radius: 22px;
          transform: translateX(-50%);
        }

        .visual-left {
          width: 245px;
          max-width: 42%;
          aspect-ratio: 4 / 3;
          left: 0;
          bottom: 28px;
          z-index: 5;
          border-radius: 18px;
          transform: rotate(-4deg);
        }

        .visual-right {
          width: 240px;
          max-width: 42%;
          aspect-ratio: 4 / 3;
          right: 0;
          bottom: 52px;
          z-index: 5;
          border-radius: 18px;
          transform: rotate(4deg);
        }

        .visual-label {
          position: absolute;
          top: 14px;
          right: 26px;
          z-index: 6;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .visual-label span {
          color: #761f3e;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 30px;
        }

        .visual-label small {
          margin-top: 3px;
          color: #99764a;
          font-size: 6.5px;
          letter-spacing: 1.25px;
        }

        .signature-strip {
          position: relative;
          z-index: 3;
          width: 100%;
          border-top: 1px solid rgba(175, 126, 62, 0.14);
          border-bottom: 1px solid rgba(175, 126, 62, 0.14);
          background: rgba(255, 255, 255, 0.29);
        }

        .signature-inner {
          width: 100%;
          max-width: 1060px;
          min-height: 62px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 24px;
          flex-wrap: wrap;
          color: #7c6965;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.8px;
          text-transform: uppercase;
        }

        .signature-inner i {
          width: 4px;
          height: 4px;
          background: #b68a4e;
          transform: rotate(45deg);
        }

        .showcase {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 1220px;
          margin: 0 auto;
          padding: 92px 24px 105px;
        }

        .section-heading {
          width: 100%;
          margin-bottom: 36px;
          display: grid;
          grid-template-columns: 45px minmax(0, 1fr) 340px;
          gap: 21px;
          align-items: end;
        }

        .heading-number {
          padding-bottom: 7px;
          color: #af854e;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 11px;
        }

        .section-kicker {
          color: #a87b40;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1.9px;
          text-transform: uppercase;
        }

        .section-heading h2,
        .system-copy h2 {
          margin: 8px 0 0;
          color: #30262a;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(33px, 4.2vw, 48px);
          font-weight: 400;
          line-height: 1.04;
          letter-spacing: -1.2px;
        }

        .section-heading h2 em,
        .system-copy h2 em {
          color: #761e3e;
          font-weight: 400;
        }

        .section-heading > p {
          margin: 0;
          padding-left: 22px;
          border-left: 1px solid rgba(174, 125, 59, 0.21);
          color: #7b6f6c;
          font-size: 12px;
          line-height: 1.75;
        }

        .cards-grid {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
        }

        .premium-card {
          min-width: 0;
          overflow: hidden;
          border-radius: 22px;
          border: 1px solid rgba(173, 132, 91, 0.20);
          background: rgba(255, 255, 255, 0.77);
          box-shadow: 0 16px 38px rgba(56, 38, 42, 0.07);
        }

        .premium-card-image {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3;
          overflow: hidden;
        }

        .premium-card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .premium-card-overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              180deg,
              transparent 70%,
              rgba(42, 27, 32, 0.18)
            );
        }

        .gold-detail {
          position: absolute;
          bottom: 0;
          left: 22px;
          width: 60px;
          height: 2px;
          background: #c0924e;
        }

        .premium-card-content {
          min-height: 215px;
          padding: 22px 22px 20px;
          display: flex;
          flex-direction: column;
        }

        .card-eyebrow {
          margin-bottom: 8px;
          color: #aa824c;
          font-size: 8.5px;
          font-weight: 800;
          letter-spacing: 1.4px;
          text-transform: uppercase;
        }

        .premium-card h3 {
          margin: 0;
          color: #31272b;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 23px;
          font-weight: 400;
        }

        .premium-card p {
          margin: 10px 0 0;
          color: #786d69;
          font-size: 12.5px;
          line-height: 1.68;
        }

        .premium-card-bottom {
          margin-top: auto;
          padding-top: 19px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .coming-soon {
          color: #917451;
          font-size: 8.5px;
          font-weight: 800;
          letter-spacing: 1.3px;
          text-transform: uppercase;
        }

        .card-action {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #761f3e;
          text-decoration: none;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .card-action span {
          color: #b98a49;
          font-size: 16px;
        }

        .mini-diamond {
          color: #bd955d;
          font-size: 5px;
        }

        .brand-message {
          position: relative;
          z-index: 2;
          width: 100%;
          overflow: hidden;
          color: white;
          background:
            linear-gradient(
              135deg,
              #35252b 0%,
              #2a1d22 100%
            );
        }

        .brand-message::before {
          content: "";
          position: absolute;
          width: 470px;
          height: 470px;
          top: -290px;
          right: -130px;
          border-radius: 50%;
          border: 1px solid rgba(211, 168, 97, 0.17);
        }

        .brand-message-inner {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          padding: 72px 24px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 0.9fr);
          gap: 75px;
          align-items: center;
        }

        .brand-message-kicker {
          color: #d2a75f;
          font-size: 8.5px;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .brand-message-copy {
          min-width: 0;
        }

        .brand-message-copy h2 {
          margin: 11px 0 17px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(39px, 5vw, 58px);
          font-weight: 400;
          line-height: 1.02;
        }

        .brand-message-copy h2 em {
          color: #d9ad67;
          font-weight: 400;
        }

        .brand-message-copy p {
          max-width: 510px;
          margin: 0;
          color: #d2c4c8;
          font-size: 13px;
          line-height: 1.75;
        }

        .brand-message-link {
          width: fit-content;
          margin-top: 25px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #fff;
          text-decoration: none;
          font-size: 9.5px;
          font-weight: 800;
          letter-spacing: 0.9px;
          text-transform: uppercase;
        }

        .brand-message-link span {
          color: #d8ad67;
          font-size: 17px;
        }

        .brand-message-side {
          min-width: 0;
          display: grid;
          gap: 12px;
        }

        .message-box {
          width: 100%;
          padding: 17px 18px;
          display: grid;
          grid-template-columns: 35px 115px minmax(0, 1fr);
          gap: 12px;
          align-items: center;
          border-top: 1px solid rgba(211, 168, 97, 0.16);
        }

        .message-box:last-child {
          border-bottom: 1px solid rgba(211, 168, 97, 0.16);
        }

        .message-number {
          color: #d2a75f;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 10px;
        }

        .message-box strong {
          color: #fff;
          font-size: 11px;
        }

        .message-box p {
          min-width: 0;
          margin: 0;
          color: #bfb0b5;
          font-size: 10.5px;
          line-height: 1.55;
        }

        .system-highlight {
          position: relative;
          z-index: 2;
          width: 100%;
          padding: 105px 24px 115px;
          overflow: hidden;
        }

        .system-highlight-inner {
          width: 100%;
          max-width: 1160px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr);
          gap: 75px;
          align-items: center;
        }

        .system-image-area {
          min-width: 0;
          position: relative;
        }

        .system-frame {
          position: relative;
          z-index: 3;
          width: 100%;
          overflow: hidden;
          border-radius: 24px;
          border: 1px solid rgba(182, 133, 65, 0.28);
          background: white;
          box-shadow: 0 24px 58px rgba(50, 34, 39, 0.13);
        }

        .system-frame img {
          width: 100%;
          height: auto;
          display: block;
        }

        .system-decoration {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(189, 139, 67, 0.23);
        }

        .system-decoration-one {
          width: 310px;
          height: 310px;
          left: -100px;
          bottom: -120px;
        }

        .system-decoration-two {
          width: 190px;
          height: 190px;
          right: -60px;
          top: -60px;
        }

        .system-copy {
          min-width: 0;
          position: relative;
          z-index: 3;
        }

        .system-copy > p {
          max-width: 440px;
          margin: 19px 0 0;
          color: #776a67;
          font-size: 13.5px;
          line-height: 1.75;
        }

        .system-features {
          width: 100%;
          margin-top: 30px;
          padding: 18px 0;
          border-top: 1px solid rgba(168, 120, 61, 0.18);
          border-bottom: 1px solid rgba(168, 120, 61, 0.18);
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .system-features div {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 5px;
          padding: 0 15px;
          border-right: 1px solid rgba(168, 120, 61, 0.15);
        }

        .system-features div:first-child {
          padding-left: 0;
        }

        .system-features div:last-child {
          border-right: 0;
        }

        .system-features strong {
          color: #b4864b;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 11px;
        }

        .system-features span {
          color: #544647;
          font-size: 10px;
          font-weight: 700;
        }

        .system-link {
          margin-top: 28px;
          display: inline-flex;
          align-items: center;
          gap: 9px;
          color: #721d3b;
          text-decoration: none;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.8px;
          text-transform: uppercase;
        }

        .system-link span {
          color: #b88a49;
          font-size: 17px;
        }

        .coming-section {
          position: relative;
          z-index: 2;
          width: 100%;
          overflow: hidden;
          background:
            linear-gradient(
              135deg,
              #2a1d22 0%,
              #3d252f 50%,
              #211619 100%
            );
        }

        .coming-decoration {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(213, 170, 101, 0.16);
        }

        .coming-one {
          width: 480px;
          height: 480px;
          right: -250px;
          top: -270px;
        }

        .coming-two {
          width: 560px;
          height: 560px;
          left: -370px;
          bottom: -460px;
        }

        .coming-inner {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 790px;
          margin: 0 auto;
          padding: 69px 20px 63px;
          text-align: center;
        }

        .coming-inner > span {
          color: #d0a45e;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 2.2px;
        }

        .coming-inner h2 {
          margin: 11px 0 14px;
          color: white;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(36px, 5vw, 55px);
          font-weight: 400;
          line-height: 1.02;
        }

        .coming-inner h2 em {
          color: #d8ad67;
          font-weight: 400;
        }

        .coming-inner p {
          max-width: 570px;
          margin: 0 auto;
          color: #cbbec2;
          font-size: 12.5px;
          line-height: 1.7;
        }

        .coming-divider {
          width: 170px;
          max-width: 100%;
          margin: 26px auto 0;
          display: flex;
          align-items: center;
          gap: 9px;
          color: #d0a45e;
          font-size: 5px;
        }

        .coming-divider i {
          flex: 1;
          height: 1px;
          background: rgba(210, 167, 99, 0.32);
        }

        .footer {
          position: relative;
          z-index: 2;
          width: 100%;
          background: #1d1619;
          padding: 22px 24px 15px;
        }

        .footer-gold-line {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(206, 158, 88, 0.38),
              transparent
            );
        }

        .footer-inner {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 25px;
          flex-wrap: wrap;
        }

        .footer-company {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .footer-company strong {
          color: #f5eef0;
          font-size: 12.5px;
        }

        .footer-company span {
          color: #9b8d92;
          font-size: 9.5px;
        }

        .footer-social {
          display: flex;
          align-items: center;
          gap: 17px;
          flex-wrap: wrap;
        }

        .footer-link {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: #d5c9cd;
          text-decoration: none;
          font-size: 10.5px;
        }

        .copyright {
          width: 100%;
          max-width: 1180px;
          margin: 15px auto 0;
          padding-top: 11px;
          border-top: 1px solid rgba(255, 255, 255, 0.055);
          text-align: center;
          color: #75696e;
          font-size: 9px;
        }

        .copyright span {
          padding: 0 8px;
          color: #9a7547;
          font-size: 4px;
        }

        .whatsapp-floating {
          position: fixed;
          right: 23px;
          bottom: 23px;
          z-index: 9999;
          width: 58px;
          height: 58px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #25d366;
          box-shadow:
            0 12px 30px rgba(19, 88, 45, 0.23),
            0 0 0 5px rgba(37, 211, 102, 0.09);
        }

        @media (max-width: 1000px) {
          .header-text {
            display: none;
          }

          .hero-inner {
            grid-template-columns: 1fr;
            gap: 35px;
          }

          .hero-copy {
            width: 100%;
            max-width: 700px;
            margin: 0 auto;
            text-align: center;
          }

          .hero-kicker {
            justify-content: center;
          }

          .hero-copy > p {
            margin-left: auto;
            margin-right: auto;
          }

          .hero-buttons {
            justify-content: center;
          }

          .construction-badge {
            margin-left: auto;
            margin-right: auto;
          }

          .hero-visual {
            width: 700px;
            max-width: 100%;
            margin: 0 auto;
          }

          .section-heading {
            grid-template-columns: 35px minmax(0, 1fr);
          }

          .section-heading > p {
            grid-column: 2 / 3;
          }

          .cards-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .brand-message-inner {
            grid-template-columns: 1fr;
            gap: 45px;
          }

          .system-highlight-inner {
            grid-template-columns: 1fr;
            max-width: 760px;
          }

          .system-copy {
            text-align: center;
          }

          .system-copy > p {
            margin-left: auto;
            margin-right: auto;
          }
        }

        @media (max-width: 680px) {
          .site {
            width: 100%;
            max-width: 100vw;
            overflow-x: hidden;
          }

          .page-decoration {
            max-width: 100vw;
          }

          .header-inner {
            min-height: 68px;
            padding: 8px 12px;
            gap: 8px;
          }

          .header-logo {
            width: 138px;
            max-width: 44vw;
            flex-shrink: 1;
          }

          .header-actions {
            flex-shrink: 0;
            gap: 0;
          }

          .header-button {
            min-height: 36px;
            padding: 0 11px;
            font-size: 8.5px;
          }

          .header-button span {
            display: none;
          }

          .hero {
            padding: 44px 16px 54px;
          }

          .hero-inner {
            width: 100%;
            max-width: 100%;
            min-height: 0;
            display: flex;
            flex-direction: column;
            gap: 28px;
          }

          .hero-copy {
            width: 100%;
            max-width: 100%;
            min-width: 0;
            margin: 0;
            text-align: center;
          }

          .hero-kicker {
            width: 100%;
            max-width: 100%;
            justify-content: center;
            gap: 7px;
            margin-bottom: 18px;
            font-size: 7.5px;
            letter-spacing: 1.1px;
          }

          .hero-kicker span {
            width: 22px;
            flex-basis: 22px;
          }

          .hero h1 {
            width: 100%;
            max-width: 100%;
            margin: 0;
            padding: 0;
            font-size: clamp(35px, 10.5vw, 43px);
            line-height: 1.04;
            letter-spacing: -1.1px;
            white-space: normal;
            word-break: normal;
            overflow-wrap: normal;
          }

          .hero h1 br {
            display: block;
          }

          .hero-copy > p {
            width: 100%;
            max-width: 330px;
            margin: 18px auto 0;
            padding: 0;
            font-size: 13px;
            line-height: 1.65;
          }

          .hero-buttons {
            width: 100%;
            max-width: 320px;
            margin: 24px auto 0;
            display: grid;
            grid-template-columns: 1fr;
            gap: 9px;
          }

          .button-primary,
          .button-secondary {
            width: 100%;
            min-height: 45px;
            padding: 0 14px;
          }

          .construction-badge {
            width: 100%;
            max-width: 320px;
            margin: 22px auto 0;
            padding: 11px 12px;
            border-radius: 15px;
            text-align: left;
          }

          .construction-badge strong,
          .construction-badge small {
            white-space: normal;
          }

          .hero-visual {
            width: 100%;
            max-width: 360px;
            height: 335px;
            margin: 0 auto;
          }

          .visual-gold-circle {
            width: 270px;
            height: 270px;
            top: 18px;
          }

          .visual-lines {
            width: 155px;
            right: 8px;
            bottom: 8px;
          }

          .visual-main {
            width: 82%;
            max-width: 295px;
            top: 43px;
            left: 50%;
            border-radius: 15px;
            transform: translateX(-50%);
          }

          .visual-left {
            width: 44%;
            max-width: 158px;
            left: 3%;
            bottom: 8px;
            border-radius: 12px;
            transform: rotate(-3deg);
          }

          .visual-right {
            width: 44%;
            max-width: 158px;
            right: 3%;
            bottom: 13px;
            border-radius: 12px;
            transform: rotate(3deg);
          }

          .visual-label {
            display: none;
          }

          .signature-inner {
            min-height: auto;
            padding: 15px 14px;
            gap: 10px;
            font-size: 7px;
            letter-spacing: 1px;
          }

          .showcase {
            padding: 58px 16px 70px;
          }

          .section-heading {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .heading-number {
            display: none;
          }

          .section-heading h2,
          .system-copy h2 {
            font-size: clamp(31px, 9.5vw, 40px);
            letter-spacing: -0.7px;
          }

          .section-heading > p {
            grid-column: auto;
            padding: 14px 0 0;
            border-left: 0;
            border-top: 1px solid rgba(174, 125, 59, 0.17);
          }

          .cards-grid {
            grid-template-columns: 1fr;
          }

          .premium-card-content {
            min-height: auto;
          }

          .premium-card-bottom {
            margin-top: 19px;
          }

          .brand-message-inner {
            padding: 55px 18px;
            gap: 38px;
          }

          .brand-message-copy h2 {
            font-size: clamp(34px, 10vw, 43px);
          }

          .message-box {
            grid-template-columns: 28px minmax(0, 1fr);
            gap: 9px;
            padding: 16px 4px;
          }

          .message-box strong {
            min-width: 0;
          }

          .message-box p {
            grid-column: 2 / 3;
          }

          .system-highlight {
            padding: 70px 16px 82px;
          }

          .system-highlight-inner {
            width: 100%;
            max-width: 100%;
            gap: 42px;
          }

          .system-decoration-one {
            width: 190px;
            height: 190px;
            left: -95px;
            bottom: -80px;
          }

          .system-decoration-two {
            width: 120px;
            height: 120px;
            right: -55px;
            top: -45px;
          }

          .system-features {
            grid-template-columns: 1fr;
          }

          .system-features div {
            padding: 10px 0;
            border-right: 0;
            border-bottom: 1px solid rgba(168, 120, 61, 0.12);
          }

          .system-features div:last-child {
            border-bottom: 0;
          }

          .system-link {
            justify-content: center;
          }

          .coming-inner {
            padding: 58px 18px 54px;
          }

          .coming-inner h2 {
            font-size: clamp(33px, 9.5vw, 43px);
          }

          .footer {
            padding: 22px 18px 15px;
          }

          .footer-inner {
            align-items: flex-start;
            flex-direction: column;
          }

          .footer-social {
            align-items: flex-start;
            flex-direction: column;
            gap: 11px;
          }

          .copyright {
            line-height: 1.6;
          }

          .whatsapp-floating {
            width: 54px;
            height: 54px;
            right: 16px;
            bottom: 16px;
          }
        }

        @media (max-width: 390px) {
          .header-logo {
            width: 126px;
          }

          .header-button {
            padding: 0 9px;
            font-size: 8px;
          }

          .hero {
            padding-left: 14px;
            padding-right: 14px;
          }

          .hero h1 {
            font-size: 36px;
          }

          .hero-copy > p {
            max-width: 300px;
          }

          .hero-visual {
            max-width: 330px;
            height: 310px;
          }

          .visual-main {
            max-width: 270px;
          }

          .visual-left,
          .visual-right {
            max-width: 142px;
          }
        }
      `}</style>
    </main>
  );
}