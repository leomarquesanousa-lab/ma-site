# MA Confecções — plataforma comercial

## Estado e ativação

**Estado consolidado em 14/10/2026:** desenvolvimento isolado em `127.0.0.1:5432/ma_commerce_local`, usuário `ma_commerce_dev`, schema `public`. As migrations `202610130001_auth_baseline` e `202610140001_commerce` já foram aplicadas exclusivamente nesse banco local, com 24 tabelas da aplicação mais `_prisma_migrations` (25 no total), histórico e checksums conferidos. Não reaplicar o inicializador, que exige banco vazio. Não aplicar essa sequência ao banco compartilhado com MA System.

Implementação local das fases A–E, com verificações direcionadas da fase F, redesign administrativo e integração R2 preparada. **Não publicada nem validada integralmente ponta a ponta.** Prisma Client 6.19.0 foi gerado com sucesso após liberação da DLL anteriormente bloqueada com EPERM. Cadastro/login local funcionam conforme confirmação do operador; a conta local foi consultada em modo somente leitura e está como ADMIN. O login direciona papéis com permissão de painel para `/admin`, preservando CUSTOMER em `/minha-conta` e a troca obrigatória de senha.

Para desenvolvimento, seguir [LOCAL_ENV.md](LOCAL_ENV.md): `npm run dev` e `npm run dev:local` usam `.env.local` privado, sem fallback para a conexão do `.env` original. Next.js e Prisma CLI compartilham a validação estrita do destino local. Os executores privilegiados ocasionais mantêm entrada interativa. [LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md) e os checkpoints preservam o histórico; este resumo e LOCAL_ENV descrevem a configuração diária atual. Nenhuma migration, instalação ou consulta ao banco foi executada na etapa de finalização do commit.

Antes de usar os módulos:

1. Revisar `prisma/schema.prisma` e o SQL aditivo em `prisma/migrations/202610140001_commerce/migration.sql` contra o schema e o histórico reais, em ambiente controlado. O SQL cria 22 tabelas e quatro enums; não altera User/Session nem seus dados. `legacy-baseline.prisma` registra o schema original do repositório, não o estado comprovado de produção.
2. Obter autorização operacional, backup e plano de recuperação antes de qualquer aplicação. Não executar automaticamente `db push`, reset ou migração a partir deste trabalho. Um banco novo também precisará do baseline de User/Session, pois este SQL pressupõe sua existência.
3. Prisma Client local já gerado com sucesso. Caso uma futura geração encontre EPERM no Windows, identificar o processo deste workspace que mantém a DLL aberta e encerrá-lo de forma controlada antes de repetir a geração; não apagar dependências nem reaplicar migrations para resolver esse erro.
4. Preservar o administrador existente. Nenhum usuário privilegiado é criado por seed, API ou cadastro público. Caso nenhum papel administrativo exista, a atribuição deverá ser realizada por operação interna autorizada, fora do cadastro público.
5. Cadastrar categorias (incluindo os slugs de navegação existentes), produtos, variantes e imagens. Não há seed com preços, estoque, pedidos ou clientes inventados.
6. Configurar áreas e vistas para os produtos CUSTOMIZABLE. Ativar produtos somente após conferir preço, variações, disponibilidade e prévia.
7. Configurar nome/política da loja. O recebimento de pedidos começa desligado. Habilitá-lo permite apenas pedidos para atendimento, com pagamento e frete pendentes.

## Arquitetura e rotas

- `lib/commerce/auth.ts`: sessão, expiração, troca obrigatória e autorização por operação.
- `lib/commerce/validation.ts`: tipos comerciais, inteiros/centavos, URLs, composição e limites rotacionados.
- `lib/commerce/admin.ts`: produtos, categorias, variantes, versões de templates e auditoria transacional.
- `lib/commerce/service.ts`: carrinho, reserva de estoque, snapshots, idempotência e transições de pedidos.
- `lib/commerce/catalog.ts`: catálogo público, filtros, busca, ordenação e paginação de 12 produtos.
- `lib/commerce/storage.ts`: armazenamento local de desenvolvimento ou R2, validação de assinatura/MIME/dimensões e decodificação completa via Sharp.
- `lib/commerce/r2.ts`: adaptador S3 SigV4 restrito ao bucket exclusivo `ma-confeccoes`; integração real ainda sem homologação.
- `lib/commerce/integrations.ts`: contratos de gateway e frete, ambos desativados.
- `app/admin`: painel restrito com dashboard, produtos, variantes, personalização, categorias, estoque, clientes, pedidos, orçamentos, configurações e auditoria.
- `app/catalogo`, `/colecoes/[categoria]/[subcategoria]`, `/produtos/[slug]`: catálogo real do banco. As URLs de coleções existentes continuam válidas; dependem do cadastro dos respectivos slugs.
- `app/carrinho`: carrinho autenticado persistente e registro de pedido para atendimento.
- `/minha-conta/enderecos`, `/minha-conta/pedidos`: cadastro real de endereços e acompanhamento real de pedidos.
- `/api/commerce/admin/*`: APIs administrativas autorizadas por recurso, GET e POST.
- `/api/commerce/cart|addresses|orders|quotes|designs`: operações vinculadas ao usuário autenticado.
- `/api/uploads`: uploads autenticados; catálogo exige permissão de produtos.
- `/api/arquivos/[id]`: entrega de imagens públicas de catálogo ou privadas do proprietário/equipe autorizada de pedidos, somente quando a arte já pertence a um pedido.
- `components/commerce/`: formulários, catálogo, painel, editor, compra, carrinho e área do cliente.
- `app/commerce.module.css`: acabamento visual responsivo e acessibilidade.

## Matriz de permissões

| Papel | Permissões |
|---|---|
| CUSTOMER | Catálogo público; próprios projetos, carrinho, endereços, pedidos e orçamentos |
| OPERATOR | Dashboard, atendimento de pedidos/orçamentos, estoque, leitura de clientes |
| MANAGER | OPERATOR + produtos, variantes, templates e categorias |
| ADMIN | MANAGER + configurações, auditoria e futura operação de pagamentos |
| DEVELOPER | Mesmas permissões de ADMIN; não existe mecanismo público para atribuir papéis |

Toda operação é conferida no servidor. A interface também filtra os módulos disponíveis. O cadastro público fixa CUSTOMER, ignorando qualquer papel enviado pelo navegador. O catálogo público usa select explícito e não expõe custos internos, usuários, tokens ou caminhos de armazenamento. APIs privadas não retornam passwordHash. Não existe endpoint para marcar pagamento como confirmado.

## Modalidades

- QUOTE_ONLY: descrição, galeria, opções, quantidade mínima, formulário autenticado e histórico administrativo. Não entra no carrinho. Uniformes cadastrados nas categorias `uniformes` devem ser QUOTE_ONLY.
- CUSTOMIZABLE: variante, texto/imagem, arraste, controles acessíveis de posição, escala e rotação, cor de texto, remoção/substituição, upload, persistência, reabertura e inclusão no carrinho referenciando o projeto.
- READY_TO_SELL: variante, preço, quantidade e carrinho sem editor. `stockControlled=false` significa sob demanda, não disponibilidade física imediata.

## Modelo de dados

Preservados User e Session. Adicionados Category, Product, ProductImage, ProductVariant, ProductOption, InventoryMovement, CustomizationTemplate, CustomizationArea, CustomerDesign, StoredAsset, Cart, CartItem, Address, Order, OrderItem, OrderStatusHistory, QuoteRequest, QuoteItem, QuoteHistory, PaymentRecord, StoreSettings e AuditLog.

Valores em centavos inteiros, sem ponto flutuante para preços. Relacionamentos históricos restringem exclusão. Produtos são arquivados logicamente. Transações serializáveis protegem checkout, estoque e edições críticas; conflitos retornam erro para recarregar/tentar novamente. Reserva ocorre ao registrar pedido; cancelamento permitido devolve a reserva conforme snapshot original. Retenção e expiração automática de reservas precisam de uma política comercial antes de automação.

O pedido guarda nome, SKU, atributos, preço unitário, composição e template, além do endereço. Alterações futuras não reescrevem esse histórico. A chave UUID de solicitação impede duplicação do pedido em retries.

## Personalização e arquivos

O canvas V1 é quadrado. A imagem-base é ajustada com `contain`, preservando proporções. Áreas administrativas são normalizadas entre 0 e 1 **em relação ao canvas quadrado**, inclusive eventuais margens da imagem. Dimensões de impressão em mm são metadados para produção, não uma promessa de DPI/exportação industrial. Um projeto salva uma vista; outras vistas podem ser cadastradas e selecionadas, mas composição multi-vista por projeto ainda requer evolução.

A cada salvamento cria-se uma versão imutável do projeto. Templates de mesmo nome recebem uma nova versão, preservando snapshots anteriores. Um projeto cujo template foi aposentado permanece no histórico/carrinho, mas não é reeditado contra áreas novas silenciosamente.

Em desenvolvimento, arquivos podem ficar em `.ma-storage/`, ignorado pelo Git e fora de public/. O adaptador R2 está implementado para bucket exclusivo e privado; produção exige R2 e recusa fallback de upload para disco. O PostgreSQL guarda somente metadados e referências estáveis `/api/arquivos/<id>`. PNG/JPEG/WebP são verificados por assinatura, MIME, dimensões e decodificação completa com Sharp; SVG e imagens animadas são recusados. Limites: 5 MiB por arquivo, 40 megapixels, 100 MiB/500 arquivos por usuário e 10 uploads/minuto. Quotas precisam de reserva atômica em infraestrutura distribuída.

Galeria administrativa: upload múltiplo sequencial, miniaturas, descrição acessível, primeira imagem como capa, reordenação, remoção de referência, progresso por arquivo e erros parciais. O formulário de mockup tem upload próprio. Salvar/cancelar fica bloqueado durante esses uploads. A ordem persiste em ProductImage.position ao salvar. Lotes acima da quota por minuto podem parar parcialmente; uploads já concluídos são preservados.

R2 utiliza variáveis privadas do servidor, objetos com UUID, escrita condicional e prefixos por produto/finalidade; produtos novos usam drafts até futura realocação. O bucket permanece privado: somente imagens comerciais são servidas publicamente pela API. Artes originais exigem propriedade ou permissão de atendimento. Não são expostas chaves ou URLs R2 assinadas. Remoção da galeria não apaga objetos físicos; não há endpoint de exclusão física. Limpeza de órfãos ainda depende de inventário, revisão de referências e autorização.

Configuração, limitações, política de órfãos, backup/rollback e bloqueios de produção estão em [R2_PRODUCTION.md](R2_PRODUCTION.md). Bucket e credenciais não foram provisionados por esta implementação, e nenhuma chamada R2 real foi executada. Arquivos já existentes no disco local ainda precisam de transferência controlada antes da publicação.

A prévia é 2D, sem renderização curva, gerenciamento de cores, prova física, exportação de impressão ou garantia de resultado industrial. Arquivos passam por validação estrutural inicial, não análise antivírus completa.

## Pagamento e frete

PaymentGateway e ShippingProvider são interfaces, sem credenciais ou implementação de fornecedor. Nenhuma taxa é inventada. `paymentStatus=PENDING_INTEGRATION` e `shippingStatus=PENDING_QUOTE` são exibidos claramente.

`Order.totalCents` nesta etapa é o total das **mercadorias**, igual ao subtotal. Não é valor final cobrável com frete. Antes de cobranças, integrar cotação de frete e consolidar o total final, implementar métodos Pix/cartão/boleto, assinaturas de webhook, idempotência, reconciliação, estornos e testes de fornecedor. PaymentRecord somente poderá ser confirmado a partir de notificação verificada. O painel não permite confirmação manual de pagamento; status CONFIRMED do pedido significa atendimento confirmado, não pagamento recebido.

## Verificações realizadas

- Schema validado offline, com configuração que explicitamente pula o carregamento de .env e URL fictícia não conectável.
- TypeScript direcionado dos novos módulos: zero diagnósticos na última verificação registrada.
- `node scripts/check-commerce-types.cjs`: verificação direcionada TypeScript e CSS, sem emissão de arquivos ou consulta ao banco.
- `node scripts/check-commerce.cjs`: checks de preços, tipos, URLs, limites de impressão e assinatura de upload, sem acesso ao banco.
- CSS parseado, sem build.
- Baseline de autenticação e migration comercial aplicados e conferidos exclusivamente no banco local isolado; não aplicados em produção.
- Prisma Client 6.19.0 gerado com sucesso; erro EPERM anterior resolvido sem exclusão de dependências.
- R2/galeria: TypeScript direcionado sem diagnósticos e checagens offline de configuração ausente, bucket alheio, prefixo privado, escrita condicional, imagem válida, MIME divergente e arquivo truncado. Assinatura/fluxo com R2 real e validação visual continuam pendentes.

Helpers: `node scripts/check-commerce-schema.cjs validate` e `node scripts/check-commerce-schema.cjs generate` usam somente engines locais Windows, configuração offline e URL fictícia. Não migram nem se conectam ao banco.

## Pendências de validação e evolução

- Produção: banco exclusivo da MA Confecções, executor de migrations separado do bloqueio local, revisão/autorização das migrations, cookies isolados do MA System, ambiente Node Hostinger confirmado e backup/rollback ensaiados. Não alterar o banco compartilhado existente.
- Validação real dos fluxos comerciais, concorrência, autorização, cancelamentos, uploads e retenção; a inicialização local e login não comprovam todos os módulos.
- Revisão visual desktop/mobile do editor, painel redesenhado e galeria, com ambiente local já provisionado.
- Galerias, atributos, opções e áreas têm campos estruturados com adição/remoção e upload. Aprimorar a configuração de áreas com seleção gráfica sobre a imagem-base, hoje definida por coordenadas numéricas normalizadas.
- Listas administrativas limitadas aos 200 registros recentes por módulo, com filtro local. Evoluir para paginação/filtros no servidor para grandes volumes.
- Melhorar ordens por preço efetivo de variante; atualmente a ordenação é explicitamente por preço-base, e filtros consideram variantes/preço promocional.
- Rate limiting distribuído, observabilidade, antivírus, tratamento/otimização de imagens, gestão de órfãos e quotas atômicas.
- Reabertura de projetos salvos funciona dentro do produto/variante e template ainda ativo. Portal independente de projetos e composição multi-vista ficam para evolução.
- Relatórios financeiros dependem de eventos reais confirmados do gateway. Sem dados, nenhum indicador é inventado.
- Integrar gateway e frete antes de venda com cobrança online.
