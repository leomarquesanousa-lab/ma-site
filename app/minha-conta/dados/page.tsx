import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";

export default async function MeusDadosPage() {
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

  const user = session.user;

  return (
    <main className="ma-page dados-page">
      <div className="ma-container">
        <section className="ma-page-header">
          <div>
            <span className="ma-eyebrow">
              Minha conta
            </span>

            <h1 className="ma-section-title">
              Meus dados
            </h1>

            <p className="ma-subtitle">
              Consulte seus dados cadastrais e informações
              de acesso à M.A.
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
          <div className="dados-grid">
            <article className="ma-card ma-card-normal">
              <div className="dados-card-header">
                <div className="ma-icon-box">
                  👤
                </div>

                <div>
                  <span className="ma-eyebrow">
                    Cadastro
                  </span>

                  <h2>
                    Informações pessoais
                  </h2>
                </div>
              </div>

              <div className="dados-list">
                <div className="dados-item">
                  <span>Nome</span>

                  <strong>
                    {user.name || "Não informado"}
                  </strong>
                </div>

                <div className="dados-item">
                  <span>E-mail</span>

                  <strong>
                    {user.email}
                  </strong>
                </div>

                <div className="dados-item">
                  <span>Conta criada em</span>

                  <strong>
                    {new Intl.DateTimeFormat(
                      "pt-BR",
                      {
                        dateStyle: "long",
                      },
                    ).format(user.createdAt)}
                  </strong>
                </div>
              </div>
            </article>

            <article className="ma-card ma-card-normal">
              <div className="dados-card-header">
                <div className="ma-icon-box">
                  🔐
                </div>

                <div>
                  <span className="ma-eyebrow">
                    Segurança
                  </span>

                  <h2>
                    Senha e acesso
                  </h2>
                </div>
              </div>

              <p className="dados-description">
                Mantenha sua senha atualizada para proteger
                sua conta, seus pedidos e suas informações.
              </p>

              <a
                href="/alterar-senha"
                className="ma-btn ma-btn-primary"
              >
                Alterar minha senha
              </a>
            </article>
          </div>
        </section>
      </div>

      <style>{`
        .dados-page {
          padding-bottom: 56px;
        }

        .dados-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .dados-card-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 24px;
        }

        .dados-card-header .ma-eyebrow {
          margin-bottom: 4px;
        }

        .dados-card-header h2 {
          margin: 0;
          font-size: 21px;
          font-weight: 750;
          line-height: 1.2;
        }

        .dados-list {
          display: grid;
        }

        .dados-item {
          display: grid;
          gap: 5px;
          padding: 15px 0;
          border-bottom:
            1px solid var(--ma-border);
        }

        .dados-item:first-child {
          padding-top: 0;
        }

        .dados-item:last-child {
          padding-bottom: 0;
          border-bottom: 0;
        }

        .dados-item span {
          color: var(--ma-text-muted);
          font-size: 12px;
          font-weight: 650;
        }

        .dados-item strong {
          color: var(--ma-text);
          font-size: 14px;
          font-weight: 700;
          overflow-wrap: anywhere;
        }

        .dados-description {
          margin:
            0 0 22px;
          color: var(--ma-text-soft);
          font-size: 14px;
          line-height: 1.65;
        }

        @media (max-width: 760px) {
          .dados-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}