"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

export default function RedefinirSenhaPage() {
  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  const token =
    searchParams.get("token") || "";

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError(
        "Link de recuperação inválido.",
      );

      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/redefinir-senha",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              token,
              password,
              confirmPassword,
            }),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Não foi possível redefinir sua senha.",
        );

        return;
      }

      setSuccess(
        data.message ||
          "Senha alterada com sucesso.",
      );

      setTimeout(() => {
        router.push(
          data.redirectTo ||
            "/login",
        );

        router.refresh();
      }, 1200);
    } catch {
      setError(
        "Não foi possível conectar ao servidor.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="ma-page">
      <div className="reset-wrap">
        <section className="reset-card ma-card">
          <div className="reset-heading">
            <span className="ma-eyebrow">
              Segurança da conta
            </span>

            <h1>
              Criar nova senha
            </h1>

            <p>
              Escolha uma nova senha para sua
              conta M.A. e MA System.
            </p>
          </div>

          {!token ? (
            <div className="ma-alert ma-alert-danger">
              Este link de recuperação é inválido
              ou está incompleto.
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="reset-form"
            >
              <div className="ma-field">
                <label
                  className="ma-label"
                  htmlFor="password"
                >
                  Nova senha
                </label>

                <input
                  id="password"
                  className="ma-input"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value,
                    )
                  }
                  placeholder="Digite sua nova senha"
                  required
                />

                <small className="password-info">
                  Mínimo de 10 caracteres,
                  com letra maiúscula,
                  minúscula, número e
                  caractere especial.
                </small>
              </div>

              <div className="ma-field">
                <label
                  className="ma-label"
                  htmlFor="confirmPassword"
                >
                  Confirmar nova senha
                </label>

                <input
                  id="confirmPassword"
                  className="ma-input"
                  type="password"
                  autoComplete="new-password"
                  value={
                    confirmPassword
                  }
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value,
                    )
                  }
                  placeholder="Digite a nova senha novamente"
                  required
                />
              </div>

              {error ? (
                <div
                  className="ma-alert ma-alert-danger"
                  role="alert"
                >
                  {error}
                </div>
              ) : null}

              {success ? (
                <div
                  className="ma-alert ma-alert-success"
                  role="status"
                >
                  {success}
                </div>
              ) : null}

              <button
                type="submit"
                className="ma-btn ma-btn-primary reset-button"
                disabled={loading}
              >
                {loading
                  ? "Alterando senha..."
                  : "Alterar minha senha"}
              </button>
            </form>
          )}

          <div className="reset-footer">
            <a
              href="/login"
              className="ma-btn ma-btn-secondary"
            >
              Voltar para o login
            </a>
          </div>
        </section>
      </div>

      <style jsx>{`
        .reset-wrap {
          width: min(
            470px,
            calc(100% - 24px)
          );

          margin:
            46px auto 70px;
        }

        .reset-card {
          padding: 30px;
        }

        .reset-heading {
          margin-bottom: 26px;
        }

        .reset-heading h1 {
          margin: 0;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 34px;
        }

        .reset-heading p {
          margin:
            11px 0 0;

          color:
            var(--ma-text-soft);

          font-size: 14px;
          line-height: 1.6;
        }

        .reset-form {
          display: grid;
          gap: 17px;
        }

        .password-info {
          color:
            var(--ma-text-muted);

          font-size: 11px;
          line-height: 1.5;
        }

        .reset-button {
          width: 100%;
          margin-top: 4px;
        }

        .reset-footer {
          display: flex;
          justify-content: center;

          margin-top: 24px;
          padding-top: 22px;

          border-top:
            1px solid
            var(--ma-border);
        }

        @media (
          max-width: 520px
        ) {
          .reset-wrap {
            margin:
              24px auto 48px;
          }

          .reset-card {
            padding:
              22px 18px;
          }

          .reset-heading h1 {
            font-size: 29px;
          }

          .reset-footer
            .ma-btn {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}