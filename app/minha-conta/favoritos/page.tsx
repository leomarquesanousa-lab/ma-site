import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";

export default async function FavoritosPage() {
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
    <main className="ma-page favoritos-page">
      <div className="ma-container">
        <section className="ma-page-header">
          <div>
            <span className="ma-eyebrow">
              Minha conta
            </span>

            <h1 className="ma-section-title">
              Favoritos
            </h1>

            <p className="ma-subtitle">
              Salve produtos que você gostou para encontrar
              novamente com facilidade.
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
          <div className="favoritos-empty ma-card ma-card-normal">
            <div className="favoritos-icon">
              ♡
            </div>

            <div className="favoritos-content">
              <span className="ma-eyebrow">
                Sua lista
              </span>

              <h2>
                Nenhum produto favorito ainda
              </h2>

              <p>
                Quando você marcar um produto como favorito,
                ele ficará salvo aqui para você consultar
                ou comprar depois.
              </p>

              <a
                href="/"
                className="ma-btn ma-btn-primary"
              >
                Ver produtos
              </a>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .favoritos-page {
          padding-bottom: 56px;
        }

        .favoritos-empty {
          min-height: 240px;
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .favoritos-icon {
          width: 74px;
          height: 74px;
          flex: 0 0 74px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: var(--ma-radius-lg);

          background: var(--ma-wine-light);
          color: var(--ma-wine);

          font-size: 36px;
          font-weight: 700;
        }

        .favoritos-content {
          flex: 1;
        }

        .favoritos-content .ma-eyebrow {
          margin-bottom: 6px;
        }

        .favoritos-content h2 {
          margin: 0 0 9px;

          color: var(--ma-text);

          font-size: 23px;
          font-weight: 750;
          line-height: 1.2;
        }

        .favoritos-content p {
          max-width: 620px;

          margin: 0 0 20px;

          color: var(--ma-text-soft);

          font-size: 14px;
          line-height: 1.65;
        }

        @media (max-width: 760px) {
          .favoritos-empty {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  );
}