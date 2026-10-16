import path from "node:path";

import { createHash } from "node:crypto";

/** Production-only TLS configuration. Never used by local development or Prisma CLI. */
export function secureNeonUrl(value: string | undefined) {
  let url: URL;
  try { url = new URL(value ?? ""); } catch { throw new Error("Configuração Neon de produção inválida."); }
  if (!["postgres:", "postgresql:"].includes(url.protocol) || !url.hostname.endsWith(".neon.tech") || !url.username || !url.password) {
    throw new Error("Configure o projeto Neon exclusivo da MA Confecções no ambiente de produção.");
  }
  if (createHash("sha256").update(url.hostname.replace("-pooler.", ".")).digest("hex").slice(0, 12) === "1628ae89a130") {
    throw new Error("Destino Neon bloqueado: contém schema de outra aplicação. Confirme o hostname do projeto maconfeccoes.");
  }
  url.searchParams.set("sslmode", "require");
  url.searchParams.set("sslaccept", "strict");
  url.searchParams.set("sslcert", path.resolve(process.cwd(), "prisma/certs/neon-root-ca.pem"));
  return url.href;
}
