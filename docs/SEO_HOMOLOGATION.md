# SEO automático — checkpoint

## Ativação autorizada na homologação — concluída

- Executor específico scripts/homologation-category-seo.cjs conferiu o endpoint homologation fixo, neondb/public, histórico das três migrations e ausência das duas colunas/histórico novo. SQL revisado estritamente: somente ADD COLUMN seoTitle/seoDescription, TEXT NOT NULL DEFAULT '', dentro de transação.
- Backup custom completo de public criado em backups/homologation/pre-category-seo-UUID.dump, com manifesto SHA-256 e listagem pg_restore validada antes da escrita. Contém dados privados de homologação: manter ACL/volume seguros e fora do Git. Não foi feito ensaio de restauração desse novo backup. Recuperação somente em destino isolado vazio mediante autorização; não limpar banco automaticamente.
- Aplicada somente 202610150002_category_seo via Prisma migrate deploy em staging restrito, com conexão direta do mesmo endpoint e TLS estrito. Baseline preservada; histórico/checksum novo concluído. Executor recusa reaplicação/estado parcial. Produção não acessada.
- Prisma Client 6.19.0 regenerado com engines existentes. Foi necessário parar e reiniciar somente o Next de homologação para liberar a DLL no Windows. Servidor reiniciado carregando somente .env.homologacao.
- scripts/check-editor-metadata.cjs: handlers reais do formulário passaram (digitação, preenchimento automático, locks manuais e preservação de registros existentes), em harness offline. Não foi teste visual de navegador.
- Testes reais por APIs autenticadas e HTTP: uma categoria fictícia hml-categoria-seo-1792112620775 criada, reaberta, editada com SEO manual e reaberta novamente. Slug original preservado. HTML público confirmou title e meta description manuais; descrição automática também conferida antes da edição. PNG próprio de 48x48 enviado via /api/uploads, associado à categoria e lido por /api/arquivos com comparação byte a byte. storageKey confirmado dentro do prefixo R2 exclusivo de homologação. Nenhuma conta, produto ou pedido modificado; fixtures/arquivo mantidos para revisão.
- Usar http://localhost:3002/cadastro e http://localhost:3002/admin. A proteção sameOrigin do Next reconhece localhost; submissões usando 127.0.0.1 foram recusadas antes de qualquer escrita. Autenticação/CSRF não foram enfraquecidos.
- Revisão visual no navegador ainda pendente (não havia navegador conectado). Produção requer migration/rollout separado e autorizado antes de receber o Client/schema novos; não publicar esse estado em produção sem provisionar as colunas.

O restante deste documento registra o checkpoint anterior à ativação; suas pendências de migration/persistência foram resolvidas acima.

Implementação: categorias e produtos geram slug/title/description durante a digitação usando editor-metadata.ts. Cada campo editado manualmente deixa de acompanhar o nome/descrição. Registros existentes preservam os valores carregados. Sugestões usam somente o conteúdo informado; keywords continuam auxiliares, sem meta tag keywords.

Categorias: campos seoTitle/seoDescription adicionados ao schema, ao formulário e ao caminho de persistência/reabertura. Migration aditiva preparada em prisma/homologation-migrations/202610150002_category_seo/migration.sql, com defaults vazios e transação. NÃO aplicada. Separada da cadeia aprovada anteriormente, para não aplicar automaticamente em produção. Nenhuma credencial/ambiente modificado.

Compatibilidade durante a preparação: Prisma Client não foi regenerado contra colunas ainda ausentes. Leituras de SEO de categorias usam consulta parametrizada separada, com fallback apenas para coluna ausente. Escrita de categoria exige as duas colunas antes de alterar qualquer registro e retorna mensagem clara se migration estiver pendente. Isso bloqueia salvar categorias até a aplicação autorizada. A consulta separada continua funcionando após futura geração do Client.

Páginas públicas: categoria usa SEO persistido e valida hierarquia ativa da URL; produto usa SEO persistido sem acrescentar outra marca ao título já salvo. Ambos usam título absoluto e fallback derivado do conteúdo. Categorias sem migration continuam exibindo metadados derivados de nome/descrição.

Validação executada: scripts/check-editor-metadata.cjs exercita os handlers reais do formulário em harness React offline (digitação, geração, edição manual e valores existentes) e verifica metadados públicos/sintaxe. Não é teste visual em navegador. /admin retornou HTTP 200 na homologação. Consulta somente de leitura confirmou ZERO colunas SEO de Category e ZERO categorias/produtos; nenhuma fixture foi criada.

Pendente: aplicação explicitamente autorizada da migration SOMENTE no endpoint homologation confirmado; Prisma Client compatível; testes reais em navegador de salvar/reabrir categoria/produto, edição manual, preservação do slug e inspeção de title/meta description no HTML das páginas públicas usando fixtures fictícias. Sem migration e sem fixtures, persistência e HTML de registros salvos NÃO foram validados. Não afirmar homologação completa.

Próxima autorização necessária: aplicar exclusivamente o SQL preparado na homologação com executor fixado no hostname confirmado, validação de destino/backup e confirmação explícita. Não usar executor neon-migrate.cjs: ele aponta para produção e seu hash de schema agora diverge por segurança. O plano de ativação de produção existente deve ser reavaliado em tarefa futura; não atualizar hashes para contornar guardas.

Nenhuma migration, seed, build completo, deploy, commit ou push. Produção não acessada.
