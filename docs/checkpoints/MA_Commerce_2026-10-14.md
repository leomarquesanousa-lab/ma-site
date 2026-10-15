# Checkpoint — E-commerce MA Confecções

Data de referência: 14/10/2026.

## Fase atual

F — revisão estática e documentação. Fases A–E implementadas no código local, com ativação e validação de runtime pendentes de provisionamento autorizado do banco. Não confundir código implementado com operação comprovada.

## Concluído no código

- Schema aditivo preservando User/Session, 22 modelos comerciais e SQL versionado não executado.
- Autorização por papel/recurso, APIs autenticadas, validação server-side e auditoria.
- Painel com CRUD de produtos/variantes/categorias, configuração de templates, estoque, dashboard, pedidos/orçamentos/clientes/configurações.
- Catálogo integrado ao Prisma, busca, filtros, paginação, produto, galeria, relacionados e destaques reais.
- Personalizador 2D interativo, arquivos privados, composição normalizada, salvamento/reabertura e referência no carrinho.
- Carrinho persistente por cliente, endereços, pedidos transacionais, snapshots, reservas/cancelamento, histórico e orçamento.
- Contratos de pagamento/frete sem integração ou cobranças.

## Arquivos

`prisma/schema.prisma`, `prisma/legacy-baseline.prisma`, `prisma/offline.config.ts`, `prisma/migrations/202610140001_commerce/migration.sql`, `prisma/migrations/migration_lock.toml`; `lib/commerce/*`; `components/commerce/*`; `app/commerce.module.css`; `app/admin/page.tsx`; `app/catalogo/page.tsx`; `app/produtos/[slug]/page.tsx`; `app/carrinho/page.tsx`; `app/api/commerce/[...path]/route.ts`; `app/api/uploads/route.ts`; `app/api/arquivos/[id]/route.ts`; `app/colecoes/[...segmentos]/page.tsx`; `app/minha-conta/enderecos/page.tsx`; `app/minha-conta/pedidos/page.tsx`; `app/page.tsx`; `components/SiteHeader.tsx`; `app/premium.module.css`; `app/api/cadastro/route.ts`; `.gitignore`; `scripts/check-commerce*.cjs`; `docs/COMMERCE.md`.

Mudanças visuais anteriores e `public/herohome-ma.png` foram preservadas; não foram revertidas.

## Evidências

Schema offline válido. TypeScript direcionado: zero diagnósticos. Checks de domínio passaram. Nenhum build completo, deploy, teste extenso, consulta ao banco ou migration aplicada. Geração Prisma parcial: substituição da DLL negada com EPERM (possivelmente em uso); tipos gerados permitiram verificação estática, mas a geração completa precisa ser repetida.

## Pendências

Ver `docs/COMMERCE.md`: provisionamento autorizado, cliente Prisma completo, revisão operacional do SQL, testes reais e visuais; configurador gráfico de áreas e paginação admin; storage durável; gateway/frete; rate limiting distribuído; política de reserva/retencão e múltiplas vistas por projeto.

## Próxima tarefa

Revisão estática e navegação concluídas. Próxima etapa: em ambiente autorizado e com migração revisada/aplicada por operador, cadastrar uma categoria/produto por modalidade e validar cada fluxo ponta a ponta. Não executar migração ou cobrança automaticamente.

## Atualização — isolamento local definitivo

Criados `.ma-commerce.local.json` (ignorado, sem senha), `scripts/dev-local.cjs`, `scripts/local-db-target.cjs`, sua declaração de tipos, `prisma.config.ts`, baseline `202610130001_auth_baseline` e `docs/LOCAL_DEVELOPMENT.md`. Alterados scripts dev/dev:local, lib/db.ts, .gitignore e documentação comercial. O destino aceito é exclusivamente 127.0.0.1:5432/ma_commerce_local, usuário ma_commerce_dev, schema public. Senha solicitada sem eco no terminal; nunca gravada em configuração ou argumentos. Autenticação existente preservada. Nenhuma conexão, migration ou geração executada nesta etapa. Próxima tarefa: revisão/autorização do baseline e da migration comercial no banco isolado, seguida da ativação local. Não usar essa sequência na Neon ou em banco já inicializado.

## Atualização — banco local inicializado (14/10/2026)

Destino e identidade conferidos por SELECT antes da escrita: 127.0.0.1:5432/ma_commerce_local, usuário ma_commerce_dev. CONNECT, USAGE e CREATE conferidos. public estava sem relações, tipos ou rotinas; histórico inexistente. Senha digitada sem eco em terminal local; nenhum segredo gravado em arquivo, argumento ou relatório.

Aplicadas pelo Prisma migrate deploy, com mecanismo local protegido e configuração que não carrega .env:

1. 202610130001_auth_baseline
2. 202610140001_commerce

Pós-verificação: nomes das 24 tabelas da aplicação mais _prisma_migrations, duas entradas concluídas no histórico, sem rollback, checksums iguais aos SQLs aprovados. Total: 25 tabelas.

Prisma Client 6.19.0 gerado com sucesso. Houve EPERM na tentativa restrita de captura do psql (sem SQL executado) e depois na substituição da DLL em uso por Next.js deste workspace. A captura foi executada fora da restrição após aprovação; a geração foi repetida offline após liberação dos processos locais que carregavam a DLL. Nenhuma dependência apagada. Nenhuma migration reaplicada para resolver a geração.

Criados scripts/init-local.cjs e scripts/local-password.cjs; dev-local reutiliza a entrada oculta. .ma-local-init-result.json é ignorado e contém apenas status/checksums/contagens. O executor de inicialização recusa banco não vazio: NÃO executá-lo novamente neste banco inicializado.

Nenhum usuário administrativo criado, nenhum servidor iniciado, nenhum build/deploy/teste completo executado. MA System e Neon não foram acessados nem alterados. Próximo passo: iniciar npm run dev:local em terminal local, cadastrar uma conta local e autorizar a promoção exclusivamente dessa conta para administração. Autenticação/painel e primeiro cadastro de produto continuam sem validação funcional.
