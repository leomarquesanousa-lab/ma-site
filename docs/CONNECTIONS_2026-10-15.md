# R2 e Neon — verificação direcionada de 15/10/2026

> ATUALIZAÇÃO APÓS INVENTÁRIO: a conexão funciona, mas o schema contém 24 tabelas de outros domínios e histórico estranho ao e-commerce. A exclusividade anteriormente confirmada não pode ser mantida como conclusão. NÃO ativar/migrar esse destino nem repetir testes remotos nele. Ver docs/NEON_SCHEMA_DIAGNOSTIC_2026-10-15.md.

## R2 corrigido e testado

O adaptador `lib/commerce/r2.ts` usa `R2_BUCKET` como fonte, sem exigir o nome antigo. O bucket definitivo é `maconfeccoes`. Valida conta, nome de bucket e chaves public/private; PUT continua condicional (`If-None-Match: *`). Autorização da API e acesso a arquivos privados não foram alterados.

Teste autorizado (`scripts/check-r2-live.cjs --run`): PNG de 96 bytes em chave UUID exclusiva private/connection-tests. PUT, GET com igualdade exata dos bytes, nova conferência antes do DELETE e HEAD final 404 passaram. Objeto removido; nenhum objeto existente acessado/alterado e nenhum registro criado no banco. DELETE existe somente no script de teste, restrito à chave criada nesta execução; não foi adicionado ao adaptador/API de produção.

## Neon e causa do P1011

Usado somente o projeto de `.env`, confirmado pelo responsável como exclusivo da MA Confecções. URL configurado direct, sem pooler. Também foi testado o endpoint pooled do mesmo identificador, sem persistir mudança de URL.

Dentro da restrição de execução, Prisma 6.19 no Windows falhou em ambos os endpoints com:

`P1011: No credentials are available in the security package (os error -2146893042)`.

Fora dessa restrição, O MESMO SCRIPT, com os mesmos parâmetros e CA, conectou e executou somente SELECT 1 e SELECT current_database(). Resultados: 1 e neondb. Conexão encerrada. Essa comparação confirma que o bloqueio observado é da execução restrita sobre o TLS nativo Windows, não de senha, nome do banco ou escolha direct/pooled. Não houve alteração no registro, nas políticas TLS do Windows ou nos certificados do sistema.

TLS Node/OpenSSL: TLS 1.3 com hostname/certificado verificados. Cadeia validada terminando na CA pública ISRG Root X1. `prisma/certs/neon-root-ca.pem` foi extraído exclusivamente das raízes confiáveis embutidas no Node, após conferir a cadeia da conexão autorizada. Não contém chave privada nem credenciais.

psql 18 passou com essa CA explícita: sslmode=verify-full, channel_binding=require e sessão read-only. Executadas somente SELECT 1 e SELECT current_database(). O teste anterior com sslrootcert=system falhava nesse cliente; o caminho explícito da CA resolveu esse caso.

Produção agora utiliza `secureNeonUrl`: Neon obrigatório, sslmode=require, sslaccept=strict e CA pública explícita. Isso evita depender do default permissivo de validação de certificados do Prisma. O teste Prisma fora da restrição passou com essas exatas opções.

Referência oficial: https://docs.prisma.io/docs/orm/v6/overview/databases/postgresql
Pooled/direct: https://github.com/neondatabase/website/blob/main/content/docs/get-started/connect-neon.md

## Ambientes preservados

- `.env` e `.env.local` não foram alterados; nenhuma credencial copiada ou impressa.
- `.env.local` continua sobrepondo DATABASE_URL no desenvolvimento e apontando para ma_commerce_local.
- dev-local, local-env, local-db-target e prisma.config.ts não foram alterados. Migrations remotas continuam bloqueadas.
- TLS Neon aplica-se somente ao runtime NODE_ENV=production. Não habilita Neon em desenvolvimento ou na CLI Prisma.
- `node scripts/check-neon-readonly.cjs --run-confirmed-project` lê exclusivamente `.env`, executa as duas consultas fixas e encerra a conexão. Exige confirmação prévia de exclusividade do projeto; neste Windows deve rodar fora da restrição que bloqueia Schannel.

## Arquivos desta etapa

- lib/commerce/r2.ts
- lib/commerce/neon.ts (novo)
- lib/db.ts
- prisma/certs/neon-root-ca.pem (CA pública, novo)
- scripts/check-r2-live.cjs (novo)
- scripts/check-neon-readonly.cjs (novo)
- docs/R2_PRODUCTION.md
- docs/CONNECTIONS_2026-10-15.md (este documento)

## Pendências para produção

1. Incluir prisma/certs/neon-root-ca.pem no pacote, no caminho esperado a partir do diretório de execução; revisar por processo confiável se a cadeia Neon mudar.
2. Configurar os segredos de produção e impedir que .env.local de desenvolvimento sobrescreva o destino. Não copiar credenciais entre ambientes.
3. Schema remoto não foi consultado nem alterado. Conectividade e autenticação não provam que as tabelas comerciais estejam provisionadas.
4. Homologar o fluxo integrado de upload/autorização/categoria no navegador e no runtime real de hospedagem. O teste R2 foi direto no adaptador, sem registros no banco.
5. Não executar testes Prisma Windows no ambiente restrito que reproduz P1011; não contornar isso desativando TLS ou validação de certificados.

Verificações offline de bucket, upload condicional, TLS estrito, CA e guardas locais passaram. TypeScript direcionado: zero diagnósticos. Nenhum build, migration, alteração de dados Neon, deploy, commit/push ou acesso ao MA System.
