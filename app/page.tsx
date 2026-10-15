import styles from "./premium.module.css";

import { collectionUrl, collections, whatsapp as contact } from "./collections";
import { Arrow, CommerceFooter, ContactBanner } from "@/components/CommercePresentation";
import FeaturedProducts from "@/components/commerce/FeaturedProducts";

export default function Home() {
  return (
    <main id="conteudo" className={styles.home}>
      <div className={styles.heroBand}><section className={`${styles.container} ${styles.hero}`} aria-labelledby="hero-title">
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>M.A. / Uniformes profissionais</span>
          <h1 id="hero-title">Uniformes que vestem<br /><span>a força da sua marca.</span></h1>
          <p>Uniformes profissionais que traduzem a identidade da sua empresa. Produtos personalizados que levam essa identidade mais longe.</p>
          <div className={styles.actions}>
            <a className={styles.button} href="#orcamento">Solicitar orçamento <Arrow /></a>
            <a className={styles.secondaryButton} href="#personalize">Conhecer a personalização <Arrow /></a>
          </div>
        </div>
        <figure className={styles.heroMedia}>
          <a href="/colecoes/uniformes" aria-label="Conhecer uniformes profissionais">
            <img src="/herohome-ma.png" alt="Composição de camiseta vinho, polo preta com detalhes dourados, jaqueta e caneca personalizada" width="1448" height="1086" fetchPriority="high" />
          </a>
        </figure>
      </section></div>

      <section className={styles.trust} aria-label="Nossa proposta">
        <div className={`${styles.container} ${styles.trustGrid}`}>
          {[
            ["M12 3l8 4v5c0 5-8 9-8 9s-8-4-8-9V7l8-4z", "Foco profissional", "Uniformes para a sua equipe"],
            ["M4 20l4-1L20 7l-3-3L5 16l-1 4zM14 7l3 3", "Identidade da marca", "Personalização para cada projeto"],
            ["M4 5h16v12H9l-5 4V5zM8 9h8M8 13h5", "Atendimento próximo", "Converse sobre a sua necessidade"],
          ].map(([path, title, text]) => <div key={title}><svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d={path} /></svg><div><strong>{title}</strong><span>{text}</span></div></div>)}
        </div>
      </section>

      <section className={`${styles.container} ${styles.section}`} id="categorias">
        <div className={styles.sectionHead}><div><span className={styles.eyebrow}>Soluções para a sua marca</span><h2>Um parceiro. Diferentes possibilidades.</h2></div><p>Da apresentação da equipe ao próximo presente corporativo.</p></div>
        <div className={styles.categories}>
          {collections.map((collection, index) => <article key={collection.slug} className={styles.category}>
            <a href={collectionUrl(collection.slug)} className={styles.categoryImage} tabIndex={-1} aria-hidden="true"><img src={collection.image} alt="" width="1448" height="1086" loading="lazy" /><span>0{index + 1}</span></a>
            <div className={styles.categoryBody}><span className={styles.categoryTop}>{collection.label}</span><h3><a href={collectionUrl(collection.slug)}>{collection.name}</a></h3><p>{collection.description}</p>
              <div className={styles.subcategories}>{collection.items.map((item) => <a key={item.slug} href={collectionUrl(collection.slug, item.slug)}>{item.name}</a>)}</div>
              <a href={collectionUrl(collection.slug)} className={styles.categoryLink}>Explorar a categoria <Arrow /></a>
            </div>
          </article>)}
        </div>
      </section>

      <section className={styles.uniformSection} id="uniformes">
        <div className={`${styles.container} ${styles.uniformGrid}`}>
          <div className={styles.uniformPhoto}><img src="/confecoes-card111.jpg" alt="Detalhes de polo e jaqueta com marca ilustrativa aplicada" loading="lazy" /><span>Uniformes profissionais / M.A.</span></div>
          <div className={styles.uniformCopy}><span className={styles.eyebrow}>O centro do nosso trabalho</span><h2>Vista a identidade<br />da sua empresa.</h2><p>Uma equipe bem apresentada comunica cuidado antes mesmo da primeira conversa. Vamos pensar nos uniformes da sua empresa a partir da sua marca e da sua necessidade. Atendimento exclusivamente sob orçamento, sem compra direta.</p><div className={styles.uniformList}><div><span>01</span><strong><a href="/colecoes/uniformes/polos">Polos profissionais</a></strong><p>Uma apresentação alinhada à sua identidade.</p></div><div><span>02</span><strong><a href="/colecoes/uniformes/camisetas">Camisetas para equipes</a></strong><p>Converse sobre modelos e possibilidades.</p></div><div><span>03</span><strong><a href="/colecoes/uniformes/jaquetas">Jaquetas personalizadas</a></strong><p>Conte o que precisa e fale com a M.A.</p></div></div><a className={styles.button} href={contact} target="_blank" rel="noopener noreferrer">Orçar uniformes pelo WhatsApp <Arrow /></a><a className={styles.textLink} href="/colecoes/uniformes">Conhecer as linhas de uniformes <Arrow /></a></div>
        </div>
      </section>

      <section className={`${styles.container} ${styles.section} ${styles.personalize}`} id="personalize">
        <div>
          <span className={styles.status}><span aria-hidden="true" /> Personalização 2D M.A.</span>
          <h2>Sua ideia na tela.<br /><span>Antes de virar produto.</span></h2>
          <p>Produtos configurados pela loja podem receber sua imagem ou texto, com posicionamento e visualização em uma prévia 2D.</p>
          <p>Escolha um produto personalizável no catálogo para criar e salvar sua arte. Pagamento e frete online aguardam integração.</p>
          <ol className={styles.workflow} aria-label="Etapas previstas para a futura personalização online">
            {["Escolher produto", "Enviar imagem ou escrever texto", "Posicionar a arte", "Visualizar mockup", "Comprar"].map((step, index) => <li key={step}><span>0{index + 1}</span>{step}</li>)}
          </ol>
          <a className={styles.textLink} href="/catalogo">Ver produtos para personalizar <Arrow /></a>
        </div>
        <figure className={styles.preview} aria-label="Ilustração do conceito futuro de personalização, sem controles interativos">
          <div className={styles.previewBar}><span>Conceito de personalização</span><span>Prévia ilustrativa</span></div>
          <div className={styles.previewCanvas}><svg viewBox="0 0 320 280" fill="none" aria-hidden="true"><path d="M111 35L67 55 21 117l48 32 24-31v130h134V118l24 31 48-32-46-62-44-20c-7 25-30 35-49 35s-42-10-49-35z" fill="#FFFFFF" stroke="#D8D0CA" strokeWidth="2" /><path d="M111 35c7 25 30 35 49 35s42-10 49-35" stroke="#B89154" strokeWidth="3" /><rect x="126" y="116" width="68" height="70" rx="2" stroke="#781834" strokeDasharray="4 4" /><text x="160" y="145" textAnchor="middle" fill="#781834" fontSize="13" fontWeight="600">SUA</text><text x="160" y="164" textAnchor="middle" fill="#781834" fontSize="13" fontWeight="600">MARCA</text></svg><span>Área de aplicação ilustrativa</span></div>
          <figcaption><span>Arte + produto + visualização</span><strong>Uma experiência que estamos construindo.</strong></figcaption>
        </figure>
      </section>

      <section className={styles.lineSection} id="brindes">
        <div className={`${styles.container} ${styles.section}`}>
          <div className={styles.sectionHead}><div><span className={styles.eyebrow}>Além do uniforme</span><h2>Mais formas de levar a sua marca.</h2></div><p>Linhas personalizáveis para projetos, presentes e ações corporativas. Consulte as possibilidades com nossa equipe.</p></div>
          <FeaturedProducts />
        </div>
      </section>

      <section className={`${styles.container} ${styles.digital}`} id="ma-digital"><div><span className={styles.eyebrow}>M.A. Digital</span><h2>Conexões além do físico.</h2></div><div><p>Conheça o MA System. Experiências com QR Code em produtos também fazem parte da visão de futuro da M.A. e estão em preparação.</p><a className={styles.textLink} href="https://app.maconfeccoes.com.br" target="_blank" rel="noopener noreferrer">Conhecer MA System <Arrow /></a></div></section>

      <ContactBanner />
      <CommerceFooter />
    </main>
  );
}
