# Publicação de produção — análise e merge preparado, não executado

Data: 16/10/2026. Site informado: `maconfeccoes.com.br`. Status: **PUBLICAÇÃO BLOQUEADA ATÉ RESOLVER OS ITENS ABAIXO E OBTER AUTORIZAÇÃO**.

## Git confirmado

- Repositório `leomarquesanousa-lab/ma-site`, público, branch padrão `main`, confirmado no GitHub.
- Branch local e remota `develop/ma-commerce`: `355a9c1f2026971ff2caa84b64e63c7340adf0e5`.
- `main` e `origin/main`, após fetch: `a41c4c3575c028f39f71b5fd28b038d6b8594b1f`.
- Diferença `origin/main...develop/ma-commerce`: zero commits exclusivos da main, dois exclusivos do desenvolvimento. Main é ancestral: integração fast-forward preserva integralmente o histórico, sem resolução de conflitos prevista.
- Trabalho inicialmente limpo. Este relatório é um arquivo novo local, não integrante do commit 355a9c1. Nenhum novo commit, merge, push ou deploy foi realizado nesta tarefa.

## Hostinger — configuração real ainda não confirmada

O domínio sozinho não identifica tipo de hospedagem, branch ligada à aplicação ou estado de auto-deploy. O repositório não contém workflow/configuração de deploy Hostinger. As consultas GitHub de checks do commit, deployments recentes e webhooks retornaram vazias; integração por GitHub App ainda pode existir e não aparecer nesses resultados.

O responsável precisa conferir no hPanel: tipo de aplicação/plano, repositório, branch selecionada, auto-deploy, Node.js, comandos de build/start e variáveis disponíveis no build/runtime. Não publicar ou fazer push para branch ligada a auto-deploy antes de resolver os bloqueios. A documentação da Hostinger descreve integração GitHub, seleção de branch e variáveis no painel, mas não comprova a configuração desta conta.

Referências oficiais:
- https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/
- https://www.hostinger.com/support/how-to-add-environment-variables-during-node-js-application-deployment/
- https://www.hostinger.com/support/how-to-redeploy-a-node-js-application/

## Ambiente e build — bloqueios encontrados

Somente configuração local foi conferida; nenhum valor secreto foi exibido ou alterado. `.env` local contém DATABASE_URL e as referências/credenciais R2 necessárias, aponta para o endpoint de produção aprovado e configura o bucket correto. Não contém MA_RUNTIME=production. Esse fato local não comprova presença/ausência das variáveis hospedadas.

1. `scripts/project-env.cjs` exige um arquivo físico `.env`; não aceita simplesmente as variáveis injetadas pelo painel como alternativa, e elimina variáveis de projeto ausentes do arquivo. Como `.env` está fora do Git, é necessário confirmar sua disponibilização privada ou adaptar explicitamente o carregamento no hosting. Não enviar `.env` para o repositório.
2. `npm run build` chama `scripts/run-next.cjs build`, que exige PostgreSQL local mesmo com MA_RUNTIME=production. Portanto o comando de build atual não está pronto para Neon na Hostinger. Não contornar o guarda usando um comando ad hoc: preparar uma entrada de build hospedado que preserve a proteção local e seja revisada/testada antes da liberação.
3. `npm start` exige `.env` físico com MA_RUNTIME=production para Neon. `next.config.ts` e `lib/db.ts` também validam o runtime.
4. Prisma Client deve ser gerado contra o schema atual no ambiente de build, com engines compatíveis com o sistema operacional hospedado. Não enviar o Client Windows de node_modules. O comando de geração configurado ainda depende do carregador do `.env`.
5. Conferir Node compatível com Next e `node:util.parseEnv`; a versão local é 24.19.0, não prova versão do hosting.

Conferência privada necessária no ambiente hospedado: DATABASE_URL de produção; MA_RUNTIME=production; MA_HOMOLOGATION ausente/desativado; ASSET_STORAGE e R2_BUCKET de produção; R2_ACCOUNT_ID/R2_ACCESS_KEY_ID/R2_SECRET_ACCESS_KEY presentes; CA pública incluída no artefato; nenhuma configuração/prefixo de homologação selecionado. Conferir SMTP/EMAIL e URL pública exigidos pelos fluxos existentes sem registrar valores.

## Neon e migrations — metadados verificados em leitura

Destino conferido antes da conexão: projeto aprovado maconfeccoes, database neondb/public. Conexão com TLS require/strict e CA pública. Transação explicitamente READ ONLY. Consultados somente identidade, colunas e histórico de migrations; nenhum registro comercial/pessoal, escrita ou migration.

Histórico concluído, sem rollback:
1. `202610130001_auth_baseline`
2. `202610140001_commerce`
3. `202610150001_studio`

`Category` possui **zero das duas colunas SEO** esperadas pelo schema atual. Migration `202610150002_category_seo` permanece pendente em produção, confirmada apenas na homologação. SQL existente é aditivo (duas colunas TEXT NOT NULL DEFAULT ''), mas fica em `prisma/homologation-migrations/`, fora da cadeia padrão de produção.

O fallback da página pública não protege todas as consultas Prisma: includes de Category e criação/edição dependem do schema. Deploy do Client/schema atuais sem provisionamento compatível é inseguro.

Não usar `homologation-category-seo.cjs` para produção. Não reaplicar o executor inicial `neon-migrate.cjs`: ele exige banco vazio e plano/schema previamente fixados; o banco já está provisionado e o schema mudou. Não executar migrate deploy genérico, db push ou reset. **Ainda não existe comando de produção revisado/pronto para esta migration específica.** Preparar executor incremental com destino/checksums, backup novo e recuperação, sem exclusões; revisar e solicitar autorização separada antes da execução. Alternativa: preparar código realmente compatível com schema antigo, sem presumir que o fallback atual seja suficiente.

## Homologação, administração, R2 e impacto

- `/admin/demo-caneca-3d` retorna notFound fora das duas flags de homologação, antes de importar autenticação. Em homologação, exige sessão e permissão de produtos.
- Página de produto só passa allowMug3D quando MA_HOMOLOGATION=1 e MA_RUNTIME=homologation. Não habilitar essas flags em produção para expor a experiência experimental.
- APIs administrativas mantêm requirePermission e operações de escrita mantêm checagem de origem. Administração legítima continuará acessível somente às contas autorizadas.
- Nenhuma migration/seed está ligada aos scripts de build/start examinados. Publicar código não deve apagar objetos ou aplicar schema automaticamente; ainda assim pode causar indisponibilidade por configuração/schema incompatíveis.
- R2 continua usando adaptador existente, bucket maconfeccoes e autorização dos originais. Sem inventário, upload, exclusão ou alteração de política nesta tarefa. Não transferir prefixo de ensaio ou credenciais de homologação para produção.
- Novos campos de composição/modos/fundo/crop exigem continuidade de validação funcional. Aparência das artes, rotação real, salvar/reabrir e compra continuam sem homologação visual completa. Não prometer recursos 3D no site definitivo enquanto estão desativados.

## Sequência de liberação a autorizar depois

1. Confirmar configuração real do hPanel, branch e auto-deploy; garantir que um push não publique prematuramente.
2. Preparar/revisar ajustes de ambiente/build hospedado sem enfraquecer bloqueios de desenvolvimento. Isso gerará novo commit candidato, caso autorizado, e exigirá nova identificação antes do merge.
3. Resolver schema SEO com backup/recuperação e executor incremental específico, mediante autorização separada; não executar comandos antigos por conveniência.
4. Gerar Client e validar build/testes em ambiente isolado compatível com produção, sem seed/migrations automáticas. Validar autenticação, arquivos, catálogo e fluxo comercial.
5. Autorizar explicitamente merge/push/deploy do commit final identificado. Não há autorização de publicação automática implícita neste relatório.

## Comandos exatos de merge/push do checkpoint, somente após liberação

Os comandos abaixo preservam main, recusam divergência e fixam o commit aprovado. Não foram executados. Se ajustes necessários gerarem outro commit, atualizar o identificador e revisar novamente; não executar esta receita para publicar 355a9c1 enquanto os bloqueios persistirem.

```powershell
Set-Location -LiteralPath 'C:\Projetos\ma-site'
git fetch origin
if ($LASTEXITCODE -ne 0) { throw 'Falha no fetch; interromper.' }
git switch main
if ($LASTEXITCODE -ne 0) { throw 'Falha ao selecionar main; interromper.' }
git merge --ff-only origin/main
if ($LASTEXITCODE -ne 0) { throw 'Main divergiu; revisar sem sobrescrever.' }
git merge --ff-only 355a9c1f2026971ff2caa84b64e63c7340adf0e5
if ($LASTEXITCODE -ne 0) { throw 'Integração não é fast-forward; revisar.' }
$releaseHead = git rev-parse HEAD
if ($LASTEXITCODE -ne 0 -or $releaseHead -ne '355a9c1f2026971ff2caa84b64e63c7340adf0e5') { throw 'Commit diferente do aprovado; interromper.' }
git push origin main
if ($LASTEXITCODE -ne 0) { throw 'Push recusado; não forçar.' }
```

Não usar force push, reset ou exclusão de branches. O deploy exato depende da confirmação do mecanismo Hostinger; não há comando/API de deploy desta conta confirmado. Build/start atuais não estão liberados para hosting. Nenhuma migration, push ou deploy está autorizado/executado por esta documentação.
