# Diagnóstico Neon MA Confecções — 15/10/2026

## Resultado: ativação bloqueada por incompatibilidade do destino

Foi usado exclusivamente o DATABASE_URL de `.env` previamente confirmado pelo responsável, com TLS estrito e CA pública. Antes do inventário, o hostname foi comparado à impressão SHA-256 previamente registrada (1628ae89a130) e o banco esperado era neondb. Isso confirmou o mesmo destino técnico dos testes anteriores, mas a confirmação de exclusividade foi contradita pelos metadados encontrados.

Após a constatação, nenhuma nova consulta remota foi realizada. Não houve consulta de registros de aplicação/clientes, DDL, escrita, migration, backup, geração de cliente, build ou deploy. A conexão foi encerrada. O script temporário de inventário foi removido para evitar reexecução sobre esse destino. Nenhuma credencial/arquivo de ambiente/código de runtime foi alterado nesta tarefa.

Não é possível afirmar apenas pelos nomes se o destino é o MA System ativo, uma cópia dele ou outro aplicativo. Não deve ser considerado banco exclusivo do e-commerce enquanto isso não for esclarecido no painel Neon.

## Inventário observado

- Banco: neondb. Schema atual e search_path efetivo: public.
- Schema de aplicação encontrado: somente public.
- 27 tabelas: 26 de aplicação e `_prisma_migrations`.
- Tabelas de outros domínios, entre outras: Baby, BabyAlbum, BabyAppointment, BabyDocument, BabyGuardian, BabyInvitation, BabyMedia, BabyPublicShare, DiaryEntry, DiaryMedia, HealthRecord, License, LicensePayment, MommyAppointment, MommyChecklistItem, MommyEntry, MommyHealthRecord, MommyMedia, MommyPregnancy, PushSubscription, QrCode, SupportAttachment e SupportTicket; também GiftPersonalization, User e Session.
- Extensão encontrada: plpgsql 1.0, no pg_catalog. As migrations locais usam recursos nativos do PostgreSQL; não exigem extensões adicionais.
- A conta consultada possui CREATE no banco e USAGE/CREATE em public. Portanto, uma execução indevida de migrations teria capacidade real de alterar esse destino.

## Migrations registradas no destino

As três entradas estavam concluídas, sem rolled_back_at; applied_steps_count=1 em cada uma:

| Migration | Situação |
|---|---|
| 20260814040651_init | Concluída |
| 20260814042525_add_sessions | Concluída |
| 20260816050224_add_baby_appointments | Concluída |

Nenhuma das três existe no histórico local deste e-commerce. Não foram lidos os logs SQL dessas entradas nem registros de clientes.

## Comparação com o projeto local

O schema local define 25 modelos. Apenas os nomes User e Session coincidem com tabelas remotas; isso não significa compatibilidade nem autoriza reaproveitamento da autenticação.

23 tabelas ausentes:

Category, Product, ProductImage, ProductVariant, ProductOption, InventoryMovement, CustomizationTemplate, CustomizationArea, CustomerDesign, StoredAsset, Artwork, Cart, CartItem, Address, Order, OrderItem, OrderStatusHistory, QuoteRequest, QuoteItem, QuoteHistory, PaymentRecord, StoreSettings, AuditLog.

Há 24 tabelas de aplicação remotas que não pertencem aos modelos deste projeto.

| Migration local | Dependência | Estado no destino |
|---|---|---|
| 202610130001_auth_baseline | Banco vazio e exclusivo; cria UserRole, User e Session | Ausente do histórico; CONFLITA com objetos existentes |
| 202610140001_commerce | Baseline de autenticação compatível; cria 22 tabelas e quatro enums comerciais | Ausente; aplicação BLOQUEADA neste destino |
| 202610150001_studio | Commerce; exige StoredAsset e CustomizationTemplate; cria Artwork e acrescenta metadados/variantes | Ausente; aplicação BLOQUEADA neste destino |

UserRole já existe no destino, com CUSTOMER/ADMIN/MANAGER/OPERATOR/DEVELOPER. O primeiro CREATE TYPE do baseline falharia por duplicidade; User e Session também já existem. A migration comercial preserva essas tabelas e criaria FKs para User: aplicá-la neste banco misturaria o e-commerce à autenticação de outro domínio, mesmo que algumas colunas fossem compatíveis. O Estúdio falharia inicialmente porque suas tabelas-base estão ausentes.

Não executar migrate resolve para simular que as migrations locais já foram aplicadas, não redefinir histórico, não usar reset/db push e não limpar o schema existente como solução.

## Plano de ativação futura — não executado

### 1. Identificar e isolar o destino correto

O responsável deve conferir no painel Neon projeto, branch e database correspondentes à conexão. Se o banco atual for de outro aplicativo ou contiver sua cópia, selecionar/criar um banco vazio exclusivo do e-commerce; não clonar dados desse domínio para ativar a loja. Registrar identificação não secreta e nova confirmação do responsável. Só então alinhar o segredo de conexão do ambiente Neon, preservando `.env.local` local e sem copiar credenciais entre ambientes.

Repetir somente o inventário de metadados no novo destino. Confirmar ausência de tabelas/tipos/rotinas comerciais pré-existentes e de histórico estrangeiro antes de classificar como vazio. Se houver objetos, parar e elaborar plano específico; não aplicar automaticamente o baseline.

### 2. Backup e possibilidade de reversão

Antes de qualquer alteração autorizada, obter backup lógico/schema do destino correto por operador autorizado, com ferramenta compatível e TLS verificado. Guardar o backup com acesso restrito/criptografia e sem credenciais em argumentos/logs. Registrar data e identidade do destino. Ensaiar restauração em ambiente isolado e confirmar a possibilidade de recuperação. Não exportar o banco suspeito nesta tarefa. Não confiar apenas no sucesso da conexão como garantia de backup.

### 3. Preparar executor remoto separado

Preservar integralmente prisma.config.ts e scripts locais que bloqueiam Neon. Em tarefa futura autorizada, preparar uma configuração/executor de produção separado, com conferência do destino aprovado e comando limitado a migrate deploy. Não utilizar npm run dev:local ou o inicializador local contra Neon. Conta de migrations separada da conta de runtime, com privilégios mínimos compatíveis; credenciais somente em memória/gerenciador de segredos.

### 4. Aplicar a cadeia somente no banco vazio confirmado

Ordem necessária:

1. 202610130001_auth_baseline — UserRole, User e Session.
2. 202610140001_commerce — 22 tabelas comerciais e suas FKs.
3. 202610150001_studio — Artwork, productType/variantIds e dimensões dos assets.

Antes da aplicação, revisar os SQLs e checksums. Depois, conferir entradas concluídas e checksums em `_prisma_migrations`, tabelas, colunas, índices e FKs. Em um banco novo, o resultado esperado é 25 tabelas de aplicação mais `_prisma_migrations`: 26 tabelas. Nenhuma aplicação foi feita neste diagnóstico.

### 5. Gerar cliente e testar consultas em etapa posterior

Gerar Prisma Client 6.19 compatível com o schema e a plataforma de hospedagem, separadamente da aplicação de migrations. Levar a CA pública e os arquivos necessários do engine para o pacote. Validar TLS estrito e consultas mínimas de User/Session, categorias/produtos/variantes, Artwork/StoredAsset e pedidos, sem expor dados pessoais. Usar um ambiente isolado e contas/dados sintéticos para testes funcionais que precisem de escrita; não criar dados de teste no domínio desconhecido.

### 6. Configurar hospedagem e liberar por etapas

Configurar DATABASE_URL Neon aprovado, ASSET_STORAGE=r2, R2_BUCKET=maconfeccoes e os segredos R2 no gerenciador de ambiente. Garantir que `.env.local` de desenvolvimento não seja publicado/sobreponha os segredos. Empacotar prisma/certs/neon-root-ca.pem no caminho esperado; validar no runtime real. Usar pooled em runtime apenas se homologado; manter conexão direct no futuro executor de migrations. Isso não autoriza migrations nem publicação nesta tarefa.

Antes de habilitar recursos comerciais, homologar autenticação, permissões, categoria com imagem, catálogo, variantes, biblioteca, projetos frente/costas, carrinho e snapshot do pedido. Conferir isolamento dos arquivos privados, retenção dos originais e revisão de arte. Recebimento de pedidos deve permanecer fechado até a homologação e decisão operacional sobre frete/pagamento. Exportação industrial de artes continua pendente conforme o checkpoint do Estúdio.

## Próximo passo exato

Conferir no painel Neon a identidade projeto/branch/database da conexão de `.env` e indicar um banco vazio realmente exclusivo da MA Confecções. Nenhuma migration deve ser aprovada para o destino inventariado. Depois da identificação correta, executar apenas o inventário de metadados e preparar a autorização do backup/executor remoto separado.
