"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AlterarSenhaPage() {
  const router = useRouter();

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setErro("");
    setSucesso("");

    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      setErro("Preencha todos os campos.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro("A nova senha e a confirmação não são iguais.");
      return;
    }

    setEnviando(true);

    try {
      const response = await fetch("/api/alterar-senha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senhaAtual,
          novaSenha,
          confirmarSenha,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErro(data.error || "Não foi possível alterar a senha.");
        setEnviando(false);
        return;
      }

      setSucesso("Senha alterada com sucesso.");

      setTimeout(() => {
        router.push("/minha-conta");
        router.refresh();
      }, 1000);
    } catch {
      setErro("Erro de comunicação com o servidor.");
      setEnviando(false);
    }
  }

  return (
    <main className="ma-page alterar-senha-page">
      <div className="ma-container alterar-senha-container">
        <section className="alterar-senha-card ma-card">
          <div className="alterar-senha-header">
            <span className="ma-eyebrow">
              Segurança
            </span>

            <h1 className="ma-section-title">
              Alterar senha
            </h1>

            <p className="ma-subtitle">
              Por segurança, informe sua senha atual e escolha uma nova senha
              para continuar usando sua conta.
            </p>
          </div>

          <form
            className="alterar-senha-form"
            onSubmit={handleSubmit}
          >
            <div className="ma-field">
              <label
                className="ma-label"
                htmlFor="senhaAtual"
              >
                Senha atual
              </label>

              <input
                id="senhaAtual"
                type="password"
                className="ma-input"
                autoComplete="current-password"
                value={senhaAtual}
                onChange={(e) =>
                  setSenhaAtual(e.target.value)
                }
                disabled={enviando}
              />
            </div>

            <div className="ma-field">
              <label
                className="ma-label"
                htmlFor="novaSenha"
              >
                Nova senha
              </label>

              <input
                id="novaSenha"
                type="password"
                className="ma-input"
                autoComplete="new-password"
                value={novaSenha}
                onChange={(e) =>
                  setNovaSenha(e.target.value)
                }
                disabled={enviando}
              />
            </div>

            <div className="ma-field">
              <label
                className="ma-label"
                htmlFor="confirmarSenha"
              >
                Confirmar nova senha
              </label>

              <input
                id="confirmarSenha"
                type="password"
                className="ma-input"
                autoComplete="new-password"
                value={confirmarSenha}
                onChange={(e) =>
                  setConfirmarSenha(e.target.value)
                }
                disabled={enviando}
              />
            </div>

            {erro && (
              <div className="ma-alert ma-alert-danger">
                {erro}
              </div>
            )}

            {sucesso && (
              <div className="ma-alert ma-alert-success">
                {sucesso}
              </div>
            )}

            <button
              type="submit"
              className="ma-btn ma-btn-primary alterar-senha-button"
              disabled={enviando}
            >
              {enviando
                ? "Alterando..."
                : "Alterar senha"}
            </button>
          </form>
        </section>
      </div>

      <style>{`
        .alterar-senha-page {
          display: flex;
          align-items: flex-start;
        }

        .alterar-senha-container {
          padding-top: 56px;
          padding-bottom: 72px;
        }

        .alterar-senha-card {
          width: min(100%, 560px);
          margin: 0 auto;
          padding: 32px;
        }

        .alterar-senha-header {
          margin-bottom: 28px;
        }

        .alterar-senha-form {
          display: grid;
          gap: 18px;
        }

        .alterar-senha-button {
          width: 100%;
          margin-top: 4px;
        }

        @media (max-width: 620px) {
          .alterar-senha-container {
            padding-top: 32px;
            padding-bottom: 48px;
          }

          .alterar-senha-card {
            padding: 22px;
          }
        }
      `}</style>
    </main>
  );
}