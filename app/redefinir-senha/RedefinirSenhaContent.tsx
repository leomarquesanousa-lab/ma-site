"use client";

import {
  FormEvent,
  useState,
} from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

export default function RedefinirSenhaContent() {
  const router = useRouter();
  const searchParams =
    useSearchParams();

  const token =
    searchParams.get("token") || "";

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError(
        "O link de redefinição de senha é inválido.",
      );
      return;
    }

    if (
      !password ||
      !confirmPassword
    ) {
      setError(
        "Preencha todos os campos.",
      );
      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      setError(
        "As senhas não são iguais.",
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
        "Senha redefinida com sucesso.",
      );

      setPassword("");
      setConfirmPassword("");

      window.setTimeout(
        () => {
          router.push("/login");
          router.refresh();
        },
        1200,
      );
    } catch (error) {
      console.error(
        "ERRO_REDEFINIR_SENHA:",
        error,
      );

      setError(
        "Não foi possível redefinir sua senha.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="reset-wrapper">
      <div className="ma-card ma-card-normal reset-card">
        <div className="reset-header">
          <span className="ma-eyebrow">
            Segurança
          </span>

          <h1 className="ma-section-title">
            Redefinir senha
          </h1>

          <p className="ma-subtitle">
            Digite sua nova senha para
            recuperar o acesso à sua conta.
          </p>
        </div>

        {!token ? (
          <div
            className="ma-alert ma-alert-error"
            role="alert"
          >
            O link de redefinição de senha
            é inválido ou está incompleto.
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="reset-form"
          >
            <div className="ma-field">
              <label
                htmlFor="password"
                className="ma-label"
              >
                Nova senha
              </label>

              <input
                id="password"
                type="password"
                className="ma-input"
                placeholder="Digite sua nova senha"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value,
                  )
                }
                autoComplete="new-password"
                required
              />
            </div>

            <div className="ma-field">
              <label
                htmlFor="confirmPassword"
                className="ma-label"
              >
                Confirmar nova senha
              </label>

              <input
                id="confirmPassword"
                type="password"
                className="ma-input"
                placeholder="Digite novamente"
                value={
                  confirmPassword
                }
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value,
                  )
                }
                autoComplete="new-password"
                required
              />
            </div>

            <p className="password-hint">
              Use pelo menos 10 caracteres,
              incluindo letra maiúscula,
              letra minúscula, número e
              caractere especial.
            </p>

            {error && (
              <div
                className="ma-alert ma-alert-error"
                role="alert"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                className="ma-alert ma-alert-success"
                role="status"
              >
                {success}
              </div>
            )}

            <button
              type="submit"
              className="ma-btn ma-btn-primary reset-button"
              disabled={loading}
            >
              {loading
                ? "Redefinindo..."
                : "Redefinir senha"}
            </button>
          </form>
        )}

        <div className="reset-footer">
          <a href="/login">
            ← Voltar para o login
          </a>
        </div>
      </div>

      <style jsx>{`
        .reset-wrapper {
          width: 100%;
          max-width: 520px;
          margin: 0 auto;
        }

        .reset-card {
          width: 100%;
        }

        .reset-header {
          margin-bottom: 26px;
        }

        .reset-header
          .ma-eyebrow {
          margin-bottom: 6px;
        }

        .reset-header
          .ma-section-title {
          margin-bottom: 8px;
        }

        .reset-form {
          display: grid;
          gap: 18px;
        }

        .password-hint {
          margin: -4px 0 0;
          color:
            var(--ma-text-muted);
          font-size: 12px;
          line-height: 1.55;
        }

        .reset-button {
          width: 100%;
          margin-top: 2px;
        }

        .reset-footer {
          margin-top: 22px;
          padding-top: 18px;
          border-top:
            1px solid
            var(--ma-border);
          text-align: center;
        }

        .reset-footer a {
          color:
            var(--ma-wine);
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
        }

        .reset-footer a:hover {
          text-decoration:
            underline;
        }
      `}</style>
    </div>
  );
}
