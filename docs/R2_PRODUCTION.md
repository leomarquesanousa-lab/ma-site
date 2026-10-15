# MA Confecções — armazenamento e publicação futura

## Estado desta entrega

Integração R2 preparada no código, sem chamadas reais, credenciais configuradas, bucket criado ou deploy. O armazenamento local continua disponível em desenvolvimento. Em produção, uploads exigem R2; não há fallback para disco efêmero. Nenhuma migration nova é necessária para os metadados existentes (`StoredAsset`, `ProductImage`).

## Configuração R2 (somente servidor)

Variáveis privadas: `ASSET_STORAGE=r2`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET=ma-confeccoes`. Não usar prefixo NEXT_PUBLIC. Configurar manualmente em `.env.local` para homologar com banco local ou no gerenciador de segredos do futuro ambiente. Nunca copiar o `.env` do MA System.

1. Criar um bucket NOVO e exclusivo `ma-confeccoes` na conta Cloudflare apropriada. Se o nome já existir, verificar titularidade e finalidade; não reutilizar outro projeto.
2. Manter acesso público `r2.dev` e domínios públicos DESATIVADOS. O bucket contém originais privados; pastas não são barreira de autorização.
3. Criar credenciais S3 de leitura/gravação restritas somente a esse bucket. Guardar o segredo fora do Git. Confirmar endpoint global padrão `<ACCOUNT_ID>.r2.cloudflarestorage.com`, região `auto`; endpoints jurisdicionais não são suportados por este adaptador.
4. Configurar as cinco variáveis privadas e reiniciar o ambiente de homologação. Não é necessário CORS do bucket: o navegador envia à API da loja, não ao R2.
5. Validar upload/leitura real em homologação antes de ativar produção. Credenciais ausentes ou bucket incorreto retornam erro, nunca sucesso fictício.

O adaptador usa HTTPS e assinatura S3 SigV4 com `node:crypto`, sem novo SDK. Upload usa UUID e condição `If-None-Match: *`. Homologar a assinatura e a escrita condicional com o bucket antes da publicação.

## Arquivos, galeria e autorização

- PNG, JPEG e WebP: até 5 MiB, até 40 milhões de pixels, dimensões limitadas. Assinatura, MIME e decodificação completa via Sharp validam o conteúdo; imagens animadas são recusadas. Originais não são recomprimidos.
- Sharp já estava instalado com Next; agora é dependência direta declarada, pois a validação o usa explicitamente. Nenhuma instalação executada.
- `public/products/<id>/catalog|mockup/<uuid>` para produtos existentes; novos produtos usam `public/drafts/<ownerId>/catalog/<uuid>`. Não há realocação automática após o primeiro salvamento.
- Artes pessoais: `private/drafts/<ownerId>/design/<uuid>`. O prefixo é organização, não autorização.
- PostgreSQL guarda MIME, bytes, proprietário, chave do objeto, visibilidade e referência `/api/arquivos/<id>`. Os binários ficam no R2 ou disco local, nunca no PostgreSQL.
- A API exige sessão, mesma origem e permissões de produtos para arquivos comerciais/mockups. Artes privadas permanecem restritas ao dono e ao atendimento autorizado quando vinculadas a pedidos, conforme a verificação existente.
- As URLs da aplicação continuam estáveis. A API faz proxy da leitura, com autorização a cada acesso privado e `private, no-store`; nenhuma URL R2 assinada ou credencial é enviada ao navegador. URLs temporárias diretas não são necessárias nesta implementação. Caso sejam adotadas futuramente, exigir a mesma autorização antes de emitir URLs de curta duração.
- Galeria: seleção múltipla, upload sequencial, progresso por arquivo, miniaturas, descrição, capa na primeira posição, reordenação e remoção da referência. Até 20 imagens por produto. Limites existentes permanecem: 10 uploads/minuto, 500 arquivos e 100 MiB por conta; lotes maiores podem parar no limite e preservam os uploads já concluídos. Ajustar quotas exige decisão separada.
- Salvar/cancelar fica bloqueado durante o upload da galeria ou mockup. Alterações da galeria só persistem ao salvar o produto. Falha de upload interrompe o lote com erro, sem inserir uma referência fictícia.
- Mockup tem upload próprio no formulário de configuração da vista. Artes pessoais usam o editor existente, com a mesma validação e adaptador.

## Remoção e órfãos

Remover da galeria remove somente a referência ao salvar; não apaga o objeto ou `StoredAsset`. NÃO há endpoint de exclusão física. Arquivos ainda referenciados estão preservados por essa política conservadora.

R2 e PostgreSQL não compartilham transação. Se a gravação de metadados falhar ou a resposta for perdida, um objeto pode ficar órfão; a API não confirma sucesso nem o apaga automaticamente, pois o INSERT pode ter sido efetivado apesar de erro de conexão.

Política proposta, ainda SEM executor de limpeza: inventário somente leitura de objetos e metadados; carência mínima de sete dias; verificar ProductImage, Category, CustomizationTemplate (incluindo versões inativas), CustomerDesign/composition/templateSnapshot e snapshots de pedidos/orçamentos; gerar relatório para revisão; backup e autorização antes de excluir. Não aplicar lifecycle de exclusão automática por prefixo/data, inclusive em drafts, que podem continuar referenciados. Limpeza física depende de mecanismo transacional de bloqueio/tombstone a implementar antes de automatizar.

## Bloqueios e sequência de produção

1. Criar projeto/banco Neon exclusivo da MA Confecções. Não usar o banco atual compartilhado. Variáveis `DATABASE_URL` e eventual conexão direta devem apontar somente ao novo projeto.
2. O `prisma.config.ts` atual é propositalmente LOCAL e rejeita Neon. Criar futuramente um mecanismo separado de produção com allowlist explícita do novo destino e aprovação; não remover a proteção local para publicar.
3. Confirmar banco novo vazio e revisar baseline `202610130001_auth_baseline` seguido de `202610140001_commerce`. As migrations locais já aplicadas não comprovam aplicação em produção. Aplicação futura exige backup e autorização; nunca reset/db push.
4. Confirmar plano Hostinger com runtime Node.js para Next SSR/API, versão compatível com Next/Prisma/Sharp, binários Linux, limite de corpo acima de 5 MiB e timeout de upload. Hospedagem apenas de arquivos estáticos não atende ao app. Plano contratado não foi consultado.
5. Preparar R2 e verificar acesso público/privado, corrupção, lotes parciais, capa/ordem e restauração. Arquivos locais já existentes precisam de transferência controlada com atualização de chaves, sem quebrar URLs; não foram migrados.
6. Variáveis adicionais: `NODE_ENV=production`, `NEXT_PUBLIC_SITE_URL` com origem HTTPS definitiva, SMTP/EMAIL exigidos pelo fluxo de recuperação existente. Não herdar credenciais de outros projetos. Não utilizar os scripts locais para operar produção.
7. Autenticação: User e Session serão exclusivos. Login/cadastro ainda configuram cookie `ma_session` no domínio pai `.maconfeccoes.com.br`; revisar para cookie host-only e nome próprio antes da publicação, incluindo logout, recuperação e troca de senha. Não há SSO validado com MA System. Não importar sessões antigas. Provisionar admin por operação interna autorizada no banco exclusivo.
8. Confirmar rotas públicas `/catalogo`, `/colecoes/...`, `/produtos/...`, login/cadastro, conta e editor; `/admin` e `/api/commerce/admin/*` exigem permissão. Nunca liberar endpoints administrativos por estarem em homologação.
9. Manter recebimento de pedidos desligado (`orderingEnabled=false`) até validação operacional. Gateways de pagamento e frete continuam desativados/pendentes; não anunciar checkout completo ou cobrança automática.
10. Publicar primeiro em ambiente separado, com banco e bucket próprios; preservar domínio/site atualmente no ar. Smoke tests e aprovação antes de trocar tráfego. Nenhuma publicação nesta etapa.

## Backup e rollback

Antes da futura ativação: guardar dump consistente do banco EXCLUSIVO, cópia dos objetos e manifesto de chaves, configuração privada em cofre e referência do release anterior. Testar restauração em ambiente separado. R2 não substitui backup independente.

Rollback: desligar pedidos, restaurar o tráfego para o release/site anterior e preservar banco/arquivos para investigação. Não apagar tabelas nem executar migrations reversas automaticamente. Restaurar banco e objetos somente com plano coordenado e autorização, evitando perda de pedidos posteriores ao backup.

## Git

Não incluir `.env*`, `.ma-storage`, JSONs locais de destino/resultado, dumps, chaves ou artes. Não usar `git add .` nesta árvore com trabalho acumulado. Revisar os arquivos explicitamente e o diff staged, com scanner de segredos que não imprima valores. Nenhum commit ou push foi executado.

## Referências

- https://developers.cloudflare.com/r2/get-started/s3/
- https://developers.cloudflare.com/r2/buckets/public-buckets/
- https://docs.aws.amazon.com/AmazonS3/latest/developerguide/sig-v4-header-based-auth.html
- https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/
