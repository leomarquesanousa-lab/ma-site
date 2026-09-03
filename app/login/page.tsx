"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

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
        await fetch("/api/login", {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email,
            password,
          }),
        });

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Não foi possível realizar o login.",
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
    <main className="login-page">
      <section className="login-card">
        <div className="brand">
          <img
            src="/logo-ma.jpg"
            alt="M.A. Confecções e Brindes"
          />

          <div>
            <span>
              M.A.
            </span>

            <small>
              Confecções e Brindes
            </small>
          </div>
        </div>

        <div className="heading">
          <span className="eyebrow">
            Área do cliente
          </span>

          <h1>
            Entre na sua conta
          </h1>

          <p>
            Use a mesma conta do
            MA System para acessar
            seus pedidos,
            personalizações e
            serviços M.A.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
        >
          <label>
            E-mail

            <input
              type="email"
              autoComplete="email"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value,
                )
              }
              required
            />
          </label>

          <label>
            Senha

            <input
              type="password"
              autoComplete="current-password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value,
                )
              }
              required
            />
          </label>

          {error ? (
            <div
              className="error"
              role="alert"
            >
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Entrando..."
              : "Entrar"}
          </button>
        </form>

        <div className="links">
          <a href="/recuperar-senha">
            Esqueci minha senha
          </a>

          <span>
            Ainda não tem conta?
          </span>

          <a
            className="create-account"
            href="/cadastro"
          >
            Criar minha conta
          </a>
        </div>

        <a
          className="back"
          href="/"
        >
          ← Voltar para a loja
        </a>
      </section>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 20px;
          background:
            radial-gradient(
              circle at top left,
              rgba(125, 25, 53, 0.09),
              transparent 35%
            ),
            #f7f5f2;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
          color: #201b1c;
        }

        .login-card {
          width: 100%;
          max-width: 470px;
          background: #ffffff;
          border: 1px solid
            rgba(0, 0, 0, 0.07);
          border-radius: 28px;
          padding: 38px;
          box-shadow:
            0 30px 80px
            rgba(28, 17, 20, 0.1);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-bottom: 38px;
        }

        .brand img {
          width: 58px;
          height: 58px;
          border-radius: 16px;
          object-fit: cover;
        }

        .brand div {
          display: flex;
          flex-direction: column;
        }

        .brand span {
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: 25px;
          font-weight: 700;
          letter-spacing: 0.02em;
          color: #781834;
        }

        .brand small {
          margin-top: 2px;
          color: #777071;
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .heading {
          margin-bottom: 30px;
        }

        .eyebrow {
          display: inline-block;
          margin-bottom: 10px;
          color: #781834;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        h1 {
          margin: 0;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: 38px;
          line-height: 1.05;
        }

        .heading p {
          margin: 15px 0 0;
          color: #6c6667;
          line-height: 1.65;
          font-size: 15px;
        }

        form {
          display: grid;
          gap: 18px;
        }

        label {
          display: grid;
          gap: 8px;
          font-size: 14px;
          font-weight: 700;
        }

        input {
          width: 100%;
          height: 52px;
          border: 1px solid #dcd6d7;
          border-radius: 14px;
          padding: 0 16px;
          background: #fff;
          color: #201b1c;
          outline: none;
          font-size: 15px;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        input:focus {
          border-color: #781834;
          box-shadow:
            0 0 0 4px
            rgba(120, 24, 52, 0.08);
        }

        button {
          height: 54px;
          border: 0;
          border-radius: 15px;
          margin-top: 4px;
          background: #781834;
          color: #ffffff;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition:
            transform 0.2s ease,
            opacity 0.2s ease;
        }

        button:hover:not(:disabled) {
          transform:
            translateY(-1px);
        }

        button:disabled {
          opacity: 0.65;
          cursor: wait;
        }

        .error {
          border-radius: 12px;
          padding: 12px 14px;
          background: #fff0f1;
          color: #a12532;
          font-size: 14px;
          line-height: 1.45;
        }

        .links {
          display: grid;
          justify-items: center;
          gap: 13px;
          margin-top: 25px;
          padding-top: 24px;
          border-top:
            1px solid #eee9ea;
          color: #777071;
          font-size: 14px;
        }

        .links a {
          color: #781834;
          text-decoration: none;
          font-weight: 700;
        }

        .create-account {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 0 20px;
          border: 1px solid #781834;
          border-radius: 13px;
        }

        .back {
          display: block;
          margin-top: 28px;
          text-align: center;
          color: #777071;
          font-size: 13px;
          text-decoration: none;
        }

        @media (
          max-width: 560px
        ) {
          .login-page {
            align-items: flex-start;
            padding: 20px 12px;
          }

          .login-card {
            padding: 28px 22px;
            border-radius: 22px;
          }

          h1 {
            font-size: 32px;
          }

          .brand {
            margin-bottom: 31px;
          }
        }
      `}</style>
    </main>
  );
}