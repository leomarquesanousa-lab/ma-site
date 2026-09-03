 import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";

export default async function EnderecosPage() {
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
    <main className="ma-page enderecos-page">
      <div className="ma-container">
        <section className="ma-page-header">
          <div>
            <span className="ma-eyebrow">
              Minha conta
            </span>

            <h1 className="ma-section-title">
              Endereços
            </h1>

            <p className="ma-subtitle">
              Cadastre e gerencie seus endereços para
              facilitar suas próximas compras.
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
          <div className="enderecos-empty ma-card ma-card-normal">
            <div className="ma-icon-box">
              📍
            </div>

            <div className="enderecos-copy">
              <span className="ma-eyebrow">
                Seus endereços
              </span>

              <h2>
                Nenhum endereço cadastrado ainda
              </h2>

              <p>
                Em breve você poderá salvar endereços como
                casa, trabalho ou presente e escolher o
                endereço desejado durante a compra.
              </p>
            </div>

            <button
              type="button"
              className="ma-btn ma-btn-primary"
              disabled
            >
              Adicionar endereço
            </button>
          </div>
        </section>
      </div>

      <style>{`
        .enderecos-page {
          padding-bottom: 56px;
        }

        .enderecos-empty {
          min-height: 210px;
          display: grid;
          grid-template-columns:
            auto 1fr auto;
          align-items: center;
          gap: 20px;
        }

        .enderecos-copy .ma-eyebrow {
          margin-bottom: 5px;
        }

        .enderecos-copy h2 {
          margin: 0 0 8px;
          font-size: 22px;
          font-weight: 750;
          line-height: 1.2;
        }

        .enderecos-copy p {
          max-width: 640px;
          margin: 0;
          color: var(--ma-text-soft);
          font-size: 14px;
          line-height: 1.65;
        }

        @media (max-width: 760px) {
          .enderecos-empty {
            grid-template-columns: 1fr;
            align-items: start;
          }

          .enderecos-empty .ma-btn {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}