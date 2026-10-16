# Novo destino Neon validado — 15/10/2026

O responsável atualizou `.env` durante a tarefa e informou explicitamente o hostname esperado do projeto maconfeccoes: `ep-soft-tooth-b62ei5ko-pooler.c-2.sa-east-1.aws.neon.tech`.

O diagnóstico recarregou somente `.env`, conferiu igualdade exata do hostname antes de conectar e utilizou Prisma com TLS require/strict e a CA pública confiável. Não acessou o endpoint antigo. Consultou somente identidade e catálogos PostgreSQL; não consultou registros de aplicação.

Resultado: conexão OK; banco neondb; schema public; 0 tabelas; nenhum view, sequência, enum/domínio ou rotina de aplicação; `_prisma_migrations` inexistente; nenhum histórico de migrations ou objeto de outra aplicação. Exclusividade confirmada pelo vínculo do hostname fornecido pelo responsável e pelo schema vazio, sem inferir identidade pelo nome neondb.

Pendentes, nesta ordem:

1. 202610130001_auth_baseline
2. 202610140001_commerce
3. 202610150001_studio

Resultado esperado após futura aplicação autorizada: 25 tabelas de aplicação mais `_prisma_migrations`. Nenhuma migration aplicada nesta tarefa.

R2: `.env` define ASSET_STORAGE=r2 e R2_BUCKET=maconfeccoes. `check-r2-live.cjs --metadata-only` respondeu HTTP 200, confirmando autenticação e acesso ao bucket. Não repetiu upload, leitura de objetos ou exclusão.

A padronização por `.env` e os bloqueios estão descritos em `docs/ENV_ONLY.md`. `dev:local` continua recusando o Neon antes de iniciar Next. Prisma CLI padrão permanece restrito ao PostgreSQL local autorizado. `.env.local` não participa do carregamento e não foi removido. Nenhum segredo ou arquivo de ambiente foi modificado pelo agente.

Próximo passo, em tarefa separada autorizada: registrar backup/schema inicial e recuperação do novo destino, preparar/revisar executor remoto separado com validação da identidade e TLS estrito, revisar a cadeia dos três SQLs e só depois autorizar aplicação. Preservar prisma.config.ts e scripts locais. Após aplicação, gerar Prisma Client compatível e homologar hospedagem/fluxos antes de habilitar pedidos. Não usar o diagnóstico antigo como inventário deste novo destino; ele descreve outro endpoint.
