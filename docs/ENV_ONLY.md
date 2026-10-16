# Configuração exclusiva por .env — 15/10/2026

## Implementado

- `scripts/project-env.cjs` lê exclusivamente o `.env` da raiz; não lê `.env.local` ou arquivos específicos por modo. Variáveis da aplicação herdadas do shell não substituem as declaradas no arquivo. Variáveis de sistema, como PATH, continuam disponíveis. Valores são interpretados como literais por `node:util.parseEnv`, sem expansão de `$` que poderia alterar senhas.
- Os comandos npm dev/dev:local, build e start passam pelos iniciadores controlados. O carregador de `@next/env` da versão instalada é adaptado em memória para receber apenas `.env`, inclusive em recarga forçada. Nenhum arquivo de node_modules é modificado, nenhuma variável secreta é inserida em `nextConfig.env`.
- Next config e o módulo do banco reaplicam a mesma fonte. Prisma config lê somente `.env` e continua aceitando apenas o destino local previamente protegido para migrations. Não há fallback para `.env.local` ou DATABASE_URL do shell.
- `.env.local` foi preservado. O inventário de chaves encontrou apenas DATABASE_URL nele, sem configurações exclusivas adicionais. Esse banco local deixa de ser escolhido automaticamente; a indisponibilidade do desenvolvimento é intencional enquanto `.env` contiver produção.
- Inicializadores administrativos legados validam a fonte `.env` e o destino local antes de prompts, relatórios ou subprocessos. O teste R2 também deixou de combinar `.env.local`.
- O endpoint anteriormente inventariado com domínio de outro aplicativo está explicitamente bloqueado no helper Neon, tanto direct quanto pooled. TLS obrigatório, validação estrita e CA pública foram mantidos.

## Estado verificado, sem conexão remota

- O agente não alterou `.env` ou `.env.local`. `.env.local` manteve seus bytes; foi detectada uma atualização externa de `.env` durante a tarefa, preservada integralmente.
- `R2_BUCKET=maconfeccoes`: confirmado.
- DATABASE_URL de `.env`: corresponde exatamente ao hostname fornecido pelo responsável para o projeto maconfeccoes. Inventário read-only com TLS estrito confirmou neondb/public, zero tabelas, sem migrations, enums/domínios ou rotinas de aplicação. Nenhum objeto de outra aplicação foi encontrado. Nome neondb não foi usado como prova de identidade.
- Hostname confirmado: ep-soft-tooth-b62ei5ko-pooler.c-2.sa-east-1.aws.neon.tech. O diagnóstico recusa outro hostname antes de conectar. Não houve acesso ao banco antigo ou ao MA System nesta tarefa.
- Shell com valores conflitantes não alterou a configuração carregada. A recarga forçada de `@next/env` retornou somente `.env`, sem leitura dos arquivos alternativos.
- Dev bloqueou antes de iniciar Next ou conectar a serviços. Nenhuma migration, inicialização de banco, upload, build, deploy ou commit/push foi executado. A verificação adicional autorizada acessou somente metadados do novo Neon e HEAD do bucket R2 (HTTP 200), sem upload/exclusão.

## Execução local e hospedagem

Com o `.env` atual de produção, npm run dev/dev:local, build e start ficam bloqueados. Para executar funcionalidades locais que escrevem, é necessária uma configuração de desenvolvimento isolada em ambiente separado, com seu próprio `.env` e PostgreSQL local autorizado; não copiar credenciais de produção nem reativar `.env.local` como fallback.

Produção deve ser uma decisão explícita: o futuro `.env` da hospedagem precisará de `MA_RUNTIME=production` para npm start, além da identidade Neon correta e CA empacotada. Essa variável NÃO foi adicionada ao `.env` nesta tarefa. NODE_ENV isolado ou herdado do shell não autoriza o banco remoto. Dev/build nunca usam essa autorização para acessar Neon. Os comandos Prisma padrão continuam exclusivamente locais; um futuro executor de migrations remotas precisará de revisão/autorização separadas.

Usar os comandos npm controlados. Não contornar os iniciadores com invocações manuais da CLI do Next ou configurações Prisma alternativas. A adaptação de `@next/env` depende da versão instalada e deve ser verificada novamente em futuras atualizações do Next.

## Arquivos desta etapa

- package.json
- next.config.ts
- prisma.config.ts
- lib/db.ts
- lib/commerce/neon.ts
- scripts/project-env.cjs e scripts/project-env.d.cts (novos)
- scripts/run-next.cjs (novo)
- scripts/dev-local.cjs
- scripts/local-env.cjs
- scripts/init-local.cjs
- scripts/promote-local-admin.cjs
- scripts/check-r2-live.cjs
- scripts/check-neon-readonly.cjs
- docs/ENV_ONLY.md (este documento)
- docs/NEON_ACTIVATION_2026-10-15.md

Documentos/checkpoints anteriores que descrevem .env.local como fonte de execução ficam substituídos por este documento. As credenciais e o arquivo legado continuam preservados.
