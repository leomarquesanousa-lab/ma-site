"use client";

import {
  FormEvent,
  useState,
} from "react";

export default function RecuperarSenhaPage() {
  const [email, setEmail] =
    useState("");

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
    setLoading(true);

    try {
      const response =
        await fetch(
          "/api/recuperar-senha",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              email,
            }),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Não foi possível iniciar a recuperação de senha.",
        );

        return;
      }

      setSuccess(
        data.message ||
          "Se existir uma conta com este e-mail, enviaremos as instruções.",
      );
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
      <div className="recover-wrap">
        <section className="recover-card ma-card">
          <div className="recover-heading">
            <span className="ma-eyebrow">
              Recuperação de acesso
            </span>

            <h1>
              Esqueci minha senha
            </h1>

            <p>
              Informe o e-mail usado na sua
              conta M.A. ou no MA System.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="recover-form"
          >
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
              className="ma-btn ma-btn-primary recover-button"
              disabled={loading}
            >
              {loading
                ? "Enviando..."
                : "Enviar instruções"}
            </button>
          </form>

          <div className="recover-footer">
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
        .recover-wrap {
          width: min(
            470px,
            calc(100% - 24px)
          );

          margin:
            46px auto 70px;
        }

        .recover-card {
          padding: 30px;
        }

        .recover-heading {
          margin-bottom: 26px;
        }

        .recover-heading h1 {
          margin: 0;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 34px;
        }

        .recover-heading p {
          margin:
            11px 0 0;

          color:
            var(--ma-text-soft);

          font-size: 14px;
          line-height: 1.6;
        }

        .recover-form {
          display: grid;
          gap: 17px;
        }

        .recover-button {
          width: 100%;
          margin-top: 4px;
        }

        .recover-footer {
          margin-top: 24px;
          padding-top: 22px;

          border-top:
            1px solid
            var(--ma-border);

          display: flex;
          justify-content: center;
        }

        @media (
          max-width: 520px
        ) {
          .recover-wrap {
            margin:
              24px auto 48px;
          }

          .recover-card {
            padding: 22px 18px;
          }

          .recover-heading h1 {
            font-size: 29px;
          }

          .recover-footer
            .ma-btn {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}