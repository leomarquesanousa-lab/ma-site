import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import LogoutButton from "@/components/LogoutButton";

const accountItems = [
  {
    href: "/minha-conta/pedidos",
    icon: "📦",
    title: "Meus pedidos",
    text: "Compras, produção, envio e entrega.",
  },
  {
    href: "/minha-conta/personalizacoes",
    icon: "🎨",
    title: "Personalizações",
    text: "Artes, aprovações e contato com a produção.",
  },
  {
    href: "/minha-conta/favoritos",
    icon: "♡",
    title: "Favoritos",
    text: "Produtos salvos para comprar depois.",
  },
  {
    href: "/minha-conta/enderecos",
    icon: "📍",
    title: "Endereços",
    text: "Gerencie seus endereços de entrega.",
  },
  {
    href: "/minha-conta/dados",
    icon: "👤",
    title: "Meus dados",
    text: "Consulte e atualize seus dados cadastrais.",
  },
];

export default async function MinhaContaPage() {
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
    <main className="ma-page account-page">
      <div className="ma-container">
        <section className="ma-page-header account-heading">
          <div>
            <span className="ma-eyebrow">Minha conta</span>

            <h1 className="ma-title">
              Olá{user.name ? `, ${user.name}` : ""}.
            </h1>

            <p className="ma-subtitle">
              Acompanhe seus pedidos, personalizações, endereços, favoritos e
              serviços M.A.
            </p>
          </div>

          <div className="account-side">
            <div className="account-user ma-card ma-card-compact">
              <div className="account-avatar">
                {(user.name || user.email)
                  .trim()
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="account-user-text">
                <strong>{user.name || "Cliente M.A."}</strong>
                <span>{user.email}</span>
              </div>
            </div>

            <LogoutButton />
          </div>
        </section>

        <section className="ma-section-sm">
          <div className="account-grid">
            {accountItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="account-card ma-card ma-card-hover"
              >
                <div className="ma-icon-box">{item.icon}</div>

                <div className="account-card-copy">
                  <h2>{item.title}</h2>
                  <p>{item.text}</p>
                </div>

                <span className="account-arrow">→</span>
              </a>
            ))}

            <a
              href="https://app.maconfeccoes.com.br"
              target="_blank"
              rel="noreferrer"
              className="account-card account-ma-system"
            >
              <div className="account-system-icon">✦</div>

              <div className="account-card-copy">
                <h2>MA System</h2>
                <p>Baby, Mommy e serviços digitais.</p>
              </div>

              <span className="account-arrow">↗</span>
            </a>
          </div>
        </section>

        <section className="account-summary ma-card">
          <div>
            <span className="ma-eyebrow">Central do cliente</span>
            <h2>Seu relacionamento com a M.A.</h2>
          </div>

          <div className="account-status-grid">
            <div>
              <strong>Pedidos</strong>
              <span>Em breve</span>
            </div>

            <div>
              <strong>Favoritos</strong>
              <span>Em breve</span>
            </div>

            <div>
              <strong>Endereços</strong>
              <span>Em breve</span>
            </div>

            <div>
              <strong>Personalizações</strong>
              <span>Em breve</span>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .account-page {
          padding-bottom: 52px;
        }

        .account-heading {
          align-items: center;
        }

        .account-heading .ma-title {
          font-size: clamp(
            34px,
            5vw,
            52px
          );
        }

        .account-side {
          display: grid;
          gap: 10px;
          justify-items: stretch;
          min-width: 270px;
        }

        .account-user {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .account-avatar {
          width: 46px;
          height: 46px;
          flex: 0 0 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: var(--ma-wine);
          color: #fff;
          font-size: 19px;
          font-weight: 700;
        }

        .account-user-text {
          min-width: 0;
          display: grid;
          gap: 4px;
        }

        .account-user-text strong {
          font-size: 14px;
        }

        .account-user-text span {
          color: var(--ma-text-muted);
          font-size: 12px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .account-grid {
          display: grid;
          grid-template-columns:
            repeat(
              3,
              minmax(0, 1fr)
            );
          gap: 12px;
        }

        .account-card {
          min-height: 112px;
          display: grid;
          grid-template-columns:
            auto 1fr auto;
          align-items: center;
          gap: 13px;
          padding: 16px;
          color: inherit;
          text-decoration: none;
        }

        .account-card-copy h2 {
          margin: 0 0 5px;
          font-size: 18px;
          font-weight: 700;
          line-height: 1.1;
        }

        .account-card-copy p {
          margin: 0;
          color: var(--ma-text-soft);
          font-size: 12px;
          line-height: 1.45;
        }

        .account-arrow {
          color: var(--ma-wine);
          font-size: 18px;
          font-weight: 800;
        }

        .account-ma-system {
          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.08
            );

          border-radius:
            var(--ma-radius-lg);

          background:
            linear-gradient(
              135deg,
              var(--ma-wine),
              var(--ma-wine-dark)
            );

          color: #fff;

          box-shadow:
            var(--ma-shadow-sm);

          transition:
            transform var(--ma-transition),
            box-shadow var(--ma-transition);
        }

        .account-ma-system:hover {
          transform:
            translateY(-3px);

          box-shadow:
            var(--ma-shadow-md);
        }

        .account-ma-system
          .account-card-copy
          p,
        .account-ma-system
          .account-arrow {
          color:
            rgba(
              255,
              255,
              255,
              0.76
            );
        }

        .account-system-icon {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background:
            rgba(
              255,
              255,
              255,
              0.13
            );
          font-size: 18px;
        }

        .account-summary {
          margin-top: 8px;
          padding: 24px;

          display: grid;

          grid-template-columns:
            0.8fr 1.2fr;

          align-items: center;
          gap: 24px;
        }

        .account-summary h2 {
          margin: 0;
          font-size: 25px;
          font-weight: 700;
        }

        .account-status-grid {
          display: grid;

          grid-template-columns:
            repeat(
              4,
              minmax(0, 1fr)
            );

          gap: 8px;
        }

        .account-status-grid > div {
          min-height: 66px;

          display: grid;
          align-content: center;

          gap: 4px;

          padding: 12px;

          border-radius:
            var(--ma-radius-md);

          background:
            var(--ma-bg-soft);

          border:
            1px solid
            var(--ma-border);
        }

        .account-status-grid strong {
          font-size: 12px;
        }

        .account-status-grid span {
          color:
            var(--ma-text-muted);

          font-size: 11px;
        }

        @media (
          max-width: 900px
        ) {
          .account-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
          }

          .account-summary {
            grid-template-columns:
              1fr;
          }

          .account-status-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
          }
        }

        @media (
          max-width: 620px
        ) {
          .account-side {
            width: 100%;
            min-width: 0;
          }

          .account-user {
            width: 100%;
          }

          .account-grid {
            grid-template-columns:
              1fr;
          }

          .account-card {
            min-height: 96px;
          }

          .account-summary {
            padding: 18px;
          }

          .account-status-grid {
            grid-template-columns:
              1fr 1fr;
          }
        }
      `}</style>
    </main>
  );
}