"use client";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

export default function CadastroPage() {
  const router =
    useRouter();

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

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

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/cadastro",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              name,
              email,
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
            "Não foi possível criar sua conta.",
        );

        return;
      }

      router.push(
        data.redirectTo ||
          "/minha-conta",
      );

      router.refresh();
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
      <div className="register-wrap">
        <section className="register-card ma-card">
          <div className="register-heading">
            <span className="ma-eyebrow">
              Área do cliente
            </span>

            <h1>
              Crie sua conta
            </h1>

            <p>
              Uma única conta para a
              loja M.A. e para o
              MA System.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="register-form"
          >
            <div className="ma-field">
              <label
                className="ma-label"
                htmlFor="name"
              >
                Nome completo
              </label>

              <input
                id="name"
                className="ma-input"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value,
                  )
                }
                placeholder="Seu nome"
                required
              />
            </div>

            <div className="ma-field">
              <label
                className="ma-label"
                htmlFor="email"
              >
                E-mail
              </label>

              <input
                id="email"
                className="ma-input"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value,
                  )
                }
                placeholder="seuemail@exemplo.com"
                required
              />
            </div>

            <div className="ma-field">
              <label
                className="ma-label"
                htmlFor="password"
              >
                Senha
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
                placeholder="Crie uma senha segura"
                required
              />

              <small className="password-info">
                Mínimo de 10 caracteres,
                com maiúscula, minúscula,
                número e caractere especial.
              </small>
            </div>

            <div className="ma-field">
              <label
                className="ma-label"
                htmlFor="confirmPassword"
              >
                Confirmar senha
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
                placeholder="Digite a senha novamente"
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

            <button
              type="submit"
              className="ma-btn ma-btn-primary register-button"
              disabled={loading}
            >
              {loading
                ? "Criando conta..."
                : "Criar minha conta"}
            </button>
          </form>

          <div className="register-footer">
            <span>
              Já possui uma conta?
            </span>

            <a
              href="/login"
              className="ma-btn ma-btn-secondary"
            >
              Entrar
            </a>
          </div>
        </section>
      </div>

      <style jsx>{`
        .register-wrap {
          width: min(
            470px,
            calc(100% - 24px)
          );

          margin:
            46px auto 70px;
        }

        .register-card {
          padding: 30px;
        }

        .register-heading {
          margin-bottom: 26px;
        }

        .register-heading h1 {
          margin: 0;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 34px;
        }

        .register-heading p {
          margin:
            11px 0 0;

          color:
            var(--ma-text-soft);

          font-size: 14px;
          line-height: 1.6;
        }

        .register-form {
          display: grid;
          gap: 17px;
        }

        .password-info {
          color:
            var(--ma-text-muted);

          font-size: 11px;
          line-height: 1.5;
        }

        .register-button {
          width: 100%;
          margin-top: 4px;
        }

        .register-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 16px;

          margin-top: 24px;
          padding-top: 22px;

          border-top:
            1px solid
            var(--ma-border);

          color:
            var(--ma-text-soft);

          font-size: 13px;
        }

        @media (
          max-width: 520px
        ) {
          .register-wrap {
            margin:
              24px auto 48px;
          }

          .register-card {
            padding: 22px 18px;
          }

          .register-heading h1 {
            font-size: 29px;
          }

          .register-footer {
            align-items: stretch;
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  );
}