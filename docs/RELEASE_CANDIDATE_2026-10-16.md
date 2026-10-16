# Candidato final — 16/10/2026

Branch develop/ma-commerce; base 355a9c1f2026971ff2caa84b64e63c7340adf0e5. Repositório leomarquesanousa-lab/ma-site. Este registro atualiza os relatórios históricos PUBLICACAO_PRODUCAO_2026-10-16.md, PRODUCTION_PREPARATION.md e BUILD_VALIDATION_2026-10-16.md: a migration SEO já foi aplicada; referências anteriores a migration pendente descrevem etapas passadas.

## Conteúdo candidato

- Variáveis hospedadas recebidas do hPanel, sem .env físico: MA_HOSTED_PRODUCTION=1, MA_RUNTIME=production e NODE_ENV=production. Validação Linux/destino Neon/R2/TLS; desenvolvimento local continua protegido; .env.homologacao preservado.
- npm run build executa scripts/run-next.cjs: prisma generate obrigatório, seguido de Next build --webpack no ambiente hospedado. npm start usa o mesmo wrapper. Não há migrations, reset, db push ou seeds automáticos nesses comandos.
- Cadeia oficial com quatro migrations; Category.seoTitle/seoDescription String @default("") compatíveis com TEXT NOT NULL DEFAULT ''. Checksum SEO idêntico ao aplicado. Evidência de aplicação/pós-validação de produção registrada no runbook; não foi repetida consulta ao banco nesta revisão.
- .gitattributes preserva bytes de migrations e CA pública. O índice anterior normalizava quebras de linha de auth_baseline/studio e não correspondia aos hashes do plano aplicado. Esses dois SQLs foram reindexados com os bytes locais aprovados, sem mudança de instruções SQL, para preservar checksums em checkout Linux/Windows.
- Recursos 3D experimentais condicionados no servidor a MA_HOMOLOGATION=1 e MA_RUNTIME=homologation. Produção hospedada recusa flags/prefixos de homologação e força MA_HOMOLOGATION=0. Rota demo retorna notFound antes de autenticação; página de produto passa allowMug3D=false em produção. Código pode existir no pacote, mas a funcionalidade não fica liberada.

## Rastreamento e arquivos privados

A revisão dos 29 manifestos NFT do build Webpack isolado identificou a .env FICTÍCIA no rastreamento. Não foram usadas credenciais reais nessa cópia. Correção: next.config.ts adiciona outputFileTracingExcludes somente no modo hospedado para .env*, backups, clusters/staging privados, cache, .git e preload da validação. Não exclui CA pública, Prisma Client nem módulos de ambiente. Desenvolvimento/homologação preservam a configuração anterior. Testes offline avaliam o config transpilado e os padrões usando o matcher distribuído com Next; não equivalem a novo build Linux.

Arquivos .env reais, backups/dumps, manifestos privados, scripts efêmeros e clusters de restauração ficam fora do commit. A CA pública versionada é necessária para TLS; não contém chave privada. Os documentos contêm somente identidades não secretas, hashes e resultados, sem credenciais.

## Validação e limites

Passaram fixtures de ambiente hospedado, isolamento de destino, geração antes de build, falha segura, Webpack e exclusões de tracing; fixtures de migration/backup; plano offline de checksums. Build anterior com Node 22.23.3/Windows/Webpack compilou, passou TypeScript e gerou 24 páginas com dados bloqueados. A alteração final de tracing foi verificada offline, sem repetir build completo. Não comprova engines Linux, variáveis reais do hPanel ou funcionamento visual/comercial do site.

Banco de produção recebeu exclusivamente SEO em tarefa anterior autorizada: quatro migrations concluídas, 26 tabelas incluindo histórico, demais estruturas/contagens preservadas. Backup/restauração e evidências privadas permanecem ignorados. Executor SEO não deve ser reaplicado: agora bloqueia pelo histórico já atualizado.

## Próximos passos separados

1. Validar build Linux/Node 22 e manifests finais na Hostinger, confirmando npm run build, npm start, variáveis no build/runtime e CA/engines Linux.
2. Autorizar separadamente integração à main/push/publicação; main tem auto-deploy. Nenhum desses passos faz parte deste checkpoint.
3. Validar navegação, autenticação, catálogo e uploads no ambiente publicado com procedimentos autorizados. Aparência das artes, rotação 3D e salvar/reabrir continuam pendentes de homologação visual no navegador; 3D não deve ser liberado em produção nesta versão.

Commit local não implica aprovação final de publicação. Nenhum build, acesso ao banco/R2, migration, merge, push ou deploy nesta revisão.
