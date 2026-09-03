import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";

export default async function MeusPedidosPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("ma_session")?.value;

  if (!token) {
    redirect("/login");
  }

  const session = await db.session.findUnique({
    where: {
      token,
    },
    include: {
      user: true,
    },
  });

  if (!session || session.expiresAt < new Date()) {
    redirect("/login");
  }

  return (
    <main className="ma-page pedidos-page">
      <div className="ma-container">
        <section className="ma-page-header">
          <div>
            <span className="ma-eyebrow">
              Minha conta
            </span>

            <h1 className="ma-section-title">
              Meus pedidos
            </h1>

            <p className="ma-subtitle">
              Acompanhe suas compras, produção, envio,
              rastreamento e histórico de pedidos.
            </p>
          </div>

          <a
            href="/minha-conta"
            className="ma-btn ma-btn-secondary"
          >
            ← Voltar para minha conta
          </a>
        </section>

        <section className="ma-section-sm">
          <div className="pedidos-empty ma-card ma-card-normal">
            <div className="pedidos-icon">
              📦
            </div>

            <div className="pedidos-content">
              <span className="ma-eyebrow">
                Histórico de compras
              </span>

              <h2>
                Você ainda não possui pedidos
              </h2>

              <p>
                Quando você realizar uma compra na M.A.,
                seus pedidos aparecerão aqui com pagamento,
                produção, envio, rastreamento e entrega.
              </p>

              <a
                href="/"
                className="ma-btn ma-btn-primary"
              >
                Conhecer produtos
              </a>
            </div>
          </div>
        </section>

        <section className="pedidos-info-grid">
          <article className="ma-card ma-card-compact">
            <div className="ma-icon-box">
              💳
            </div>

            <div>
              <strong>
                Pagamento
              </strong>

              <span>
                Acompanhe aprovação e confirmação.
              </span>
            </div>
          </article>

          <article className="ma-card ma-card-compact">
            <div className="ma-icon-box">
              🧵
            </div>

            <div>
              <strong>
                Produção
              </strong>

              <span>
                Veja o andamento dos itens personalizados.
              </span>
            </div>
          </article>

          <article className="ma-card ma-card-compact">
            <div className="ma-icon-box">
              🚚
            </div>

            <div>
              <strong>
                Envio
              </strong>

              <span>
                Consulte rastreamento e entrega.
              </span>
            </div>
          </article>
        </section>
      </div>

      <style>{`
        .pedidos-page {
          padding-bottom: 56px;
        }

        .pedidos-empty {
          min-height: 250px;
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .pedidos-icon {
          width: 74px;
          height: 74px;
          flex: 0 0 74px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: var(--ma-radius-lg);

          background: var(--ma-wine-light);

          font-size: 31px;
        }

        .pedidos-content {
          flex: 1;
        }

        .pedidos-content .ma-eyebrow {
          margin-bottom: 6px;
        }

        .pedidos-content h2 {
          margin: 0 0 9px;

          color: var(--ma-text);

          font-size: 23px;
          font-weight: 750;
          line-height: 1.2;
        }

        .pedidos-content p {
          max-width: 650px;

          margin: 0 0 20px;

          color: var(--ma-text-soft);

          font-size: 14px;
          line-height: 1.65;
        }

        .pedidos-info-grid {
          display: grid;

          grid-template-columns:
            repeat(3, minmax(0, 1fr));

          gap: 14px;

          margin-top: 18px;
        }

        .pedidos-info-grid article {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .pedidos-info-grid article > div:last-child {
          display: grid;
          gap: 4px;
        }

        .pedidos-info-grid strong {
          color: var(--ma-text);

          font-size: 13px;
          font-weight: 750;
        }

        .pedidos-info-grid span {
          color: var(--ma-text-muted);

          font-size: 12px;
          line-height: 1.4;
        }

        @media (max-width: 760px) {
          .pedidos-empty {
            align-items: flex-start;
            flex-direction: column;
          }

          .pedidos-info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}