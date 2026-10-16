# Runbook — migrations Neon MA Confecções

Preparação inicial em 15/10/2026, seguida da validação de backup/restauração descrita ao final. NENHUMA migration foi aplicada. Fonte exclusiva: `.env`. O executor refaz a verificação de banco vazio antes de qualquer aplicação futura.

## Destino e TLS

- Projeto confirmado: maconfeccoes.
- Hostname configurado conferido nesta etapa: ep-soft-tooth-b62ei5ko-pooler.c-2.sa-east-1.aws.neon.tech.
- Hostname direct derivado do MESMO endpoint: ep-soft-tooth-b62ei5ko.c-2.sa-east-1.aws.neon.tech.
- Database neondb; schema public; porta 5432.
- Nenhuma URL/credencial alterada ou copiada para arquivos. `.env.local` não é carregado.
- Executor Prisma: sslmode=require, sslaccept=strict e CA pública explícita. Backup libpq: verify-full, mesma CA, channel_binding=require, sessão read-only.
- A conexão direct será verificada pelo preflight da execução futura. Não foi repetido teste de conectividade nesta preparação.

## Compatibilidade revisada

Foi gerado SQL esperado exclusivamente do schema local com Prisma 6.19 (`migrate diff --from-empty --to-schema-datamodel ... --script`, configuração offline e URL fictícia), sem shadow database, conexão ou execução de SQL. Comparação estática da cadeia existente com esse SQL:

- 25 tabelas e suas colunas/tipos/defaults.
- 5 enums e valores.
- 25 primary keys.
- 32 foreign keys, incluindo ações DELETE/UPDATE.
- 36 índices secundários/únicos.

Os objetos correspondem, com três ressalvas de nullability: CustomizationTemplate.variantIds, Artwork.tags e Artwork.compatibleTypes são TEXT[] NOT NULL nas migrations. Prisma gera TEXT[] sem NOT NULL para essas listas. A cadeia é mais restritiva: o código atual envia arrays e é compatível. Não é equivalência literal perfeita do DDL; revisões futuras de drift devem considerar essa diferença. Nenhum SQL existente foi alterado para remover a proteção ou mudar checksums.

Dependências/ordem obrigatórias:

1. 202610130001_auth_baseline — cria UserRole, User e Session; exige destino realmente vazio.
2. 202610140001_commerce — depende de User; cria 22 tabelas, quatro enums e FKs comerciais.
3. 202610150001_studio — depende de CustomizationTemplate e StoredAsset; cria Artwork, productType, variantIds e dimensões dos arquivos.

Resultado esperado após aplicação futura: 25 tabelas de aplicação + _prisma_migrations = 26. Não inclui seed, conta administrativa, produtos ou configurações comerciais.

## Executor específico e travas

`prisma/neon-activation-plan.json` registra alvo não secreto, SHA-256 do schema/CA e checksums das três migrations. `scripts/neon-migration-plan.cjs` recusa outro hostname/database/schema, migrations extras, arquivos alterados ou SQL fora das operações aditivas revisadas.

`scripts/neon-migrate.cjs`:

- Default/--plan: somente lê configuração/arquivos locais; não conecta nem cria staging.
- --apply exige TTY interativo, backup de até 24h e atestado de restauração isolada vinculado ao checksum do arquivo e ao plano.
- Preflight lê somente identidade, privilégios e catálogos. Banco com tabelas, histórico, views, sequências, enums/domínios ou rotinas de aplicação é recusado. Não tenta reset, baseline automático, resolve ou retry.
- Exibe o destino sem credenciais; exige a frase exata `AUTORIZO MIGRATIONS maconfeccoes/neondb/public <12 primeiros caracteres do planHash>`.
- Revalida backup, configuração e banco vazio depois da confirmação.
- Só então cria snapshot temporário dos SQLs e configuração Prisma. O snapshot fica em `.ma-neon-activation/<UUID>`, ignorado pelo Git; não contém a URL de conexão. A autorização do filho é efêmera e ligada ao processo pai; a configuração aceita apenas migrate deploy.
- Não usa shadow database, não gera client nem executa seed. O comando e parâmetros não são escolhidos pelo usuário.
- Verifica o histórico/checksums e a quantidade de tabelas ao terminar. Saída bruta do engine não é impressa, para evitar vazamento de URLs/segredos.
- Remove apenas seu staging, com verificação de caminho real antes da exclusão recursiva. Nunca exclui objetos do banco, backups ou arquivos R2.

prisma.config.ts, dev:local e os guardas locais NÃO foram alterados. A CLI padrão continua recusando Neon. Não há configuração remota permanente para contornar a confirmação.

## Backup — procedimento futuro, não executado

1. Manter o site comercial fechado e impedir alterações concorrentes no destino. Confirmar o plano com:

```powershell
node scripts/neon-migrate.cjs --plan
node scripts/neon-backup.cjs --plan
```

2. Em terminal interativo normal, fora da restrição Windows que bloqueia Schannel, executar SOMENTE após autorização da próxima etapa:

```powershell
node scripts/neon-backup.cjs --create
```

O script confere destino/schema vazio, exige `BACKUP maconfeccoes/neondb/public`, usa o pg_dump 18 já instalado e TLS verify-full. Não recebe senha/URL como argumento. A conexão e a senha são passadas apenas no ambiente do subprocesso. O PostgreSQL permanece read-only.

Cria exclusivamente, sem sobrescrever arquivos:

- backups/neon/pre-migration.dump — formato custom PGDMP, schema public, sem owners/ACL.
- backups/neon/pre-migration.manifest.json — identidade, data, hash, planHash e restauração PENDENTE.

Diretório backups já é ignorado pelo Git. Proteger por ACL/volume criptografado; formato custom é compactação, NÃO criptografia. Mesmo no banco vazio, guardar o estado inicial e a identidade. O dump é do schema public e não inclui configuração global/roles nem arquivos R2.

3. Conferir integridade/listagem local, sem tocar em banco:

```powershell
& 'C:/Program Files/PostgreSQL/18/bin/pg_restore.exe' --list backups/neon/pre-migration.dump
```

4. Responsável deve disponibilizar e autorizar separadamente um destino de restauração isolado e vazio. Restaurar com pg_restore --exit-on-error, sem --clean e sem --create, usando identidade explícita desse destino. NÃO usar MA System, o endpoint antigo ou um banco local já utilizado. A restauração escreve no destino isolado e não faz parte desta tarefa nem do executor de migrations.

5. Somente após a restauração real validada, atualizar no manifesto do backup:

```json
"restoreTest": {
  "isolated": true,
  "passed": true,
  "verifiedAt": "DATA_HORA_UTC_REAL_DO_TESTE"
}
```

O executor valida formato PGDMP, SHA-256, projeto/host/database/schema, idade e planHash, mas o atestado de restauração é responsabilidade humana; não afirma ter comprovado uma restauração automaticamente. Se os arquivos já existirem, arquivá-los sob controle do responsável e planejar novo backup; os scripts não apagam/sobrescrevem backups.

## Comando exato de aplicação FUTURA

Após backup, restauração isolada e autorização, em C:\Projetos\ma-site:

```powershell
node scripts/neon-migrate.cjs --apply --backup-manifest backups/neon/pre-migration.manifest.json
```

O comando ainda exige a confirmação digitada. Sem manifesto válido/atestado, banco vazio ou TTY, para sem escrever. Não usar `npx prisma migrate deploy` com a configuração padrão, nem copiar credenciais para configurações alternativas.

Depois de sucesso confirmado, gerar Prisma Client compatível em etapa separada e homologar consultas/fluxos antes de liberar pedidos. Gerar client não deve ser usado para resolver falha de migration.

## Falha e recuperação

- As migrations existentes não têm BEGIN/COMMIT. Com Prisma 6, não considerar a cadeia atomicamente reversível: falha/timeout pode deixar objetos e entrada de migration incompleta. Os SQLs já usados localmente não foram reescritos para adicionar transações.
- Em falha, congelar a ativação; preservar backup/manifesto e coletar apenas metadados/histórico. Não repetir o executor, resetar, apagar schema ou marcar migration como aplicada.
- O dump inicial vazio NÃO remove objetos criados parcialmente; pg_restore sem limpeza não é rollback automático. Diagnosticar e preparar correção explícita ou restauração em destino isolado, com nova autorização e nova revisão de identidade. Qualquer cleanup no banco de produção exige tarefa separada e aprovação específica.
- Restringir acesso concorrente durante backup/aplicação; advisory lock do Prisma protege executores de migrations, mas não todo DDL externo.
- Manter CA no pacote/caminho revisado. Atualmente *.pem é ignorado pelo Git; prever inclusão controlada desse certificado público no empacotamento futuro, sem incluir chaves privadas.
- Privilégios USAGE/CREATE no schema e runtime do engine devem ser homologados na execução futura. Não foram testados no direct nesta etapa.

Fontes oficiais: [Prisma e transações em migrations PostgreSQL](https://www.prisma.io/blog/prisma-migrate-dx-primitives), [pg_dump](https://www.postgresql.org/docs/18/app-pgdump.html), [backup/pg_restore](https://www.postgresql.org/docs/18/backup-dump.html).

## Verificações desta preparação

Host/configuração conferidos sem rede. Sintaxe dos scripts e testes offline dos guardas passaram. Fixtures cobriram destino incorreto, migration alterada/extra, ausência de TTY, checksum do backup, banco não vazio, confirmação inválida, configuração temporária com token/comando inválidos e pós-verificação divergente. Banco, CLI e escritas de filesystem foram substituídos por mocks nesses testes. Somente --plan foi executado nos executores reais. Nenhum backup, restauração, client generation ou migration aplicado.

Arquivos: .gitignore; prisma/neon-activation-plan.json; scripts/neon-migration-plan.cjs; scripts/neon-migrate.cjs; scripts/neon-backup.cjs; scripts/check-neon-migration-executor.cjs; este documento. Migrations, schema, credenciais e arquivos .env não alterados.

## Validação posterior do backup — 15/10/2026

- Os três NOT NULL foram preservados: variantIds tem default [], e o cadastro de artes fornece tags (inclusive []) e compatibleTypes. O Prisma Client aceita esses arrays; NULL não faz parte do contrato desses campos. Outros consumidores devem fornecer tags/compatibleTypes, pois não possuem default SQL. Nenhum checksum de migration mudou.
- Destino conferido novamente pelo carregador exclusivo do .env e pelo preflight do backup: endpoint aprovado maconfeccoes, neondb/public vazio. Nenhum teste geral de conexão foi repetido.
- Backup custom criado em backups/neon/pre-migration.dump, sem owners/ACL. Corrigida a passagem de PGSERVICE/PGSERVICEFILE vazios: agora essas variáveis são removidas do subprocesso pg_dump. TLS verify-full e CA preservados.
- scripts/neon-restore-rehearsal.cjs --run criou um cluster PostgreSQL 18 local independente, com SCRAM, senha aleatória temporária e acesso somente 127.0.0.1. Não usa serviços/bancos locais existentes nem outros projetos Neon. A senha temporária foi removida; não integra backup/relatório.
- Como initdb já cria public, o ensaio excluiu somente a entrada duplicada CREATE SCHEMA public da lista TOC usada pelo pg_restore; dump original intacto. Restauração com --exit-on-error, sem --clean/--create, catálogo public confirmado com zero tabelas. Servidor do ensaio encerrado antes de atestar o manifesto. Clusters de ensaio ficam ignorados pelo Git em .ma-neon-restore/; todos foram encerrados.
- Manifesto atualizado com restauração isolada real validada, método e timestamp. Continua vinculado ao SHA-256 do dump e ao plano aprovado. Validade do backup: 24 horas conforme executor; depois disso será necessário novo backup/ensaio sem sobrescrever o anterior.
- CA pública conferida pelo hash do plano. Exceção específica adicionada ao .gitignore para prisma/certs/neon-root-ca.pem; outras chaves/certificados continuam ignorados. Não houve commit.
- Migrations prontas para confirmação interativa futura, não executadas. Comando de aplicação permanece o da seção anterior. O ensaio valida a recuperação do estado vazio, não comprova rollback de DDL parcial nem testa as migrations.
