# Preparação de produção — 16/10/2026

Código preparado na develop/ma-commerce; sem publicação, commit, build completo, geração real do Client, conexão ao banco ou operações R2 nesta etapa. Este documento atualiza os bloqueios de ambiente/build descritos em PUBLICACAO_PRODUCAO_2026-10-16.md. A migration continua pendente em produção; nenhuma aplicação foi feita.

## Ambiente Hostinger

No hPanel, configurar privadamente e disponibilizar tanto no build quanto no runtime:

- `MA_HOSTED_PRODUCTION=1` — ativação explícita; válida somente em Linux.
- `MA_RUNTIME=production` e `NODE_ENV=production`.
- `DATABASE_URL` do endpoint aprovado de produção, pooled ou direct, neondb/public.
- `ASSET_STORAGE=r2`, `R2_BUCKET=maconfeccoes` e R2_ACCOUNT_ID/R2_ACCESS_KEY_ID/R2_SECRET_ACCESS_KEY reais.
- Flags de homologação ausentes/desativadas; remover HOMOLOGATION_* e R2_TEST_PREFIX. Não definir segredos em NEXT_PUBLIC_*.
- Preservar SMTP/EMAIL e URL pública quando usados pelos fluxos existentes.

`project-env.cjs` lê diretamente process.env nesse modo; não exige ou lê `.env`, `.env.local` ou `.env.homologacao`. Mantém variáveis da plataforma, inclusive PORT. Recusa hostname divergente, runtime incorreto, Windows, parâmetros de homologação, configuração R2 incompleta e ausência da CA pública. Força TLS require/strict com certificado em caminho absoluto. Não faz testes de rede ao validar configuração.

Fora desse modo explícito, permanece o carregamento de `.env` para o fluxo normal ou `.env.homologacao` para homologação. Um arquivo local não pode ativar MA_HOSTED_PRODUCTION. Guardas locais de banco continuam válidos; `dev` é recusado no modo hospedado.

## Build e start após autorização de publicação

Hostinger Node.js 22.x, build `npm run build`, start `npm start`. Instalação pelo lockfile (`npm ci`) no sistema Linux da plataforma, incluindo dependências necessárias à compilação. Não enviar node_modules do Windows.

No modo hospedado, `npm run build` valida configuração, executa **somente prisma generate** com o Prisma instalado e, se concluir, chama Next build. Isso gera o Client/engines no ambiente Linux. Saída do gerador é capturada e não despejada no log; falha interrompe o build com mensagem segura. Não há migrate deploy, seed, db push ou reset ligado ao build/start. Build pode avaliar consultas de leitura de páginas: o banco deve estar compatível antes do deploy. Não foi executado build real aqui.

`prisma.config.ts` permanece com seu guarda: generate é permitido, comandos normais de banco continuam bloqueados para Neon remoto. Não contornar isso com comandos improvisados. Next/Client preservam guards de produção/homologação e a UI experimental 3D continua desabilitada em produção.

## Migration oficial SEO

`prisma/migrations/202610150002_category_seo/migration.sql` é cópia byte a byte do SQL já aplicado na homologação, preservando seu checksum. O arquivo histórico em homologation-migrations é mantido. SQL: transação com dois ADD COLUMN TEXT NOT NULL DEFAULT ''; sem DROP, UPDATE ou exclusão de dados. Migrations iniciais não foram alteradas.

Executor futuro `scripts/production-category-seo.cjs`:

- `--check` revisa arquivos/checksums offline, sem ler credenciais ou abrir banco.
- `--apply` exige terminal interativo, backup genuíno recente e manifesto, ensaio de restauração isolada associado ao mesmo dump, histórico exato das três migrations concluídas e ausência das colunas SEO.
- Conexão direta somente do projeto aprovado, TLS estrito/CA conferida, preflight em transação READ ONLY.
- Confirmação digitada exatamente pelo responsável; não automatizar. Revalidação antes de aplicar.
- Configuração temporária vinculada ao processo e token efêmero, cadeia oficial de quatro migrations, com só SEO pendente. Não libera a CLI padrão.
- Falha interrompe sem retry/reset/correção destrutiva; pós-validação do histórico/checksum e das duas colunas.

Comandos específicos, **aplicação somente em tarefa futura autorizada**:

```powershell
node scripts/production-category-seo.cjs --check
# Após backup atual, restauração isolada comprovada e autorização explícita:
node scripts/production-category-seo.cjs --apply --backup-manifest backups/neon/pre-category-seo.manifest.json
```

O primeiro comando passou nesta preparação. O segundo NÃO foi executado. Não usar o executor de homologação nem o executor inicial de banco vazio.

### Backup obrigatório ainda pendente

Criar backup custom real de public no destino aprovado, ensaiar restauração em ambiente isolado autorizado e registrar manifesto privado sob backups/. Não fabricar sucesso nem reaproveitar um manifesto antigo de banco vazio. O executor exige:

```json
{
  "project": "maconfeccoes",
  "branch": "production",
  "hostname": "ep-soft-tooth-b62ei5ko.c-2.sa-east-1.aws.neon.tech",
  "database": "neondb",
  "schema": "public",
  "createdAt": "DATA_ISO_DO_BACKUP_REAL",
  "dumpFile": "backups/neon/pre-category-seo.dump",
  "sha256": "SHA256_DO_DUMP_REAL",
  "restoreTest": {
    "isolated": true,
    "passed": true,
    "backupSha256": "MESMO_SHA256_DO_DUMP_RESTAURADO",
    "verifiedAt": "DATA_ISO_DO_ENSAIO_REAL"
  }
}
```

Este exemplo é somente formato, não evidência. Backup e ensaio precisam ter menos de 24h; ensaio deve ocorrer após a criação do backup. Arquivo deve ser PGDMP, checksum correto e caminho real contido em backups/. Não incluir credenciais. Backup incremental/ensaio deste release não foram realizados; adaptação do procedimento de backup existente deve respeitar o banco já provisionado, sem usar guardas de banco vazio.

## Verificações executadas

- `node scripts/check-hosted-production.cjs`: fixtures offline de ambiente Linux, TLS/destino, ausência de leituras .env, carregamento local/homologação, generate antes de build, falha de geração e bloqueio de dev.
- `node scripts/check-production-category-seo.cjs`: cadeia e SQL, CA/checksums, backup recente, vínculo do ensaio ao dump, paths, arquivo corrompido e confirmação interativa. Filesystem/banco/processos de execução são fixtures; nenhuma migration executada.
- `node scripts/production-category-seo.cjs --check`: revisão offline aprovada.
- Sintaxe Node dos scripts e TypeScript direcionado para prisma.config.ts, next.config.ts e lib/db.ts.
- `node scripts/dev-homologation.cjs --check`: configuração existente segue válida, sem inicialização de servidor ou rede.

## Pendências para publicar

Confirmar flags/variáveis e comandos no hPanel; validar em Linux/Node 22 com build completo somente após autorização; preparar backup/ensaio reais; autorizar migration SEO separadamente; validar fluxos e testes visuais pendentes. Só então criar/revisar novo commit candidato e autorizar merge/push. Como main tem auto-deploy, push é publicação: não executar antes da liberação. Rollback preferencial por artefato anterior, preservando as colunas aditivas e todos os dados. Nenhum push/merge/commit/deploy foi realizado.
