# Desenvolvimento local isolado — MA Confecções

## Destino autorizado

Somente PostgreSQL `127.0.0.1:5432`, banco `ma_commerce_local`, usuário `ma_commerce_dev`, schema `public`. A existência e o conteúdo desse banco não foram consultados nesta etapa.

`.ma-commerce.local.json` contém somente esses parâmetros, está ignorado pelo Git e NÃO aceita campos adicionais, incluindo senha. Em outro checkout, recrie esse JSON com os mesmos cinco campos; ele não é versionado.

## Inicialização local

Execute `npm run dev:local` (ou `npm run dev`) em um terminal interativo na raiz do repositório. Digite a senha quando solicitada: a entrada é oculta, não aceita pipeline/argumento e não é salva em arquivo. O processo filho recebe DATABASE_URL somente em memória. A senha continua sendo um segredo do processo: administradores do sistema operacional podem inspecionar processos; isso não substitui um gerenciador de segredos em produção.

O iniciador abre o Next em `http://127.0.0.1:3001`, força NODE_ENV=development e substitui DATABASE_URL antes de o Next carregar os arquivos de ambiente. O `.env` original permanece intacto. Valores SMTP/EMAIL são esvaziados no processo local para impedir envio usando credenciais herdadas. Recuperação de senha por e-mail ficará indisponível até configurar um serviço exclusivamente de teste.

## Barreiras de destino

- `scripts/local-db-target.cjs`: valida host literal, porta, banco, usuário, protocolo e schema; rejeita parâmetros extras de conexão, destinos remotos e configuração ausente.
- `lib/db.ts`: em modo não produção, exige o destino local antes de criar/reutilizar PrismaClient. Um cliente global anterior sem a marca local correta não é reutilizado.
- `prisma.config.ts`: configuração padrão da CLI não carrega .env e recusa DATABASE_URL ausente ou fora do destino local.
- Helpers offline existentes continuam usando `--config prisma/offline.config.ts` e URL fictícia, sem conexão ao banco.

São barreiras da aplicação e dos comandos padrão, não um firewall. Comandos externos, configurações explicitamente alternativas ou código que as ignore não estão autorizados por este procedimento. Não usar a URL Neon em variáveis de sessão, comandos ou scripts. Não usar npm start / NODE_ENV=production como atalho local; a configuração de produção não foi modificada.

## Banco vazio — sequência preparada, NÃO aplicada

1. Confirmar por operação posterior autorizada que o destino é exclusivamente local, que o banco está vazio e que o usuário possui os direitos necessários no schema public. Não atribuir privilégios administrativos desnecessários.
2. Rever `prisma/migrations/202610130001_auth_baseline/migration.sql`: cria UserRole, User, Session e seus índices/relacionamento. É exclusivo para banco vazio; não aplicar sobre autenticação já existente.
3. Rever `prisma/migrations/202610140001_commerce/migration.sql`: cria os modelos comerciais e referencia User.
4. Aplicar, somente após autorização, as migrations nessa ordem pelo histórico Prisma. Não executar reset, db push ou resolver migrations como aplicadas sem correspondência real no banco. Nenhum executor de migrations foi adicionado ao iniciador.
5. Regenerar Prisma Client com os processos do projeto parados: `node scripts/check-commerce-schema.cjs generate`. Esse helper é offline; a senha do banco não é necessária. O EPERM anterior precisa ser resolvido caso persista.
6. Iniciar `npm run dev:local`, cadastrar uma conta local pelo fluxo existente e promover somente essa conta por operação administrativa local autorizada. Nenhum seed ou administrador público foi criado.
7. Cadastrar uma categoria e um produto em rascunho. Produtos compráveis exigem variante ativa; personalizáveis também exigem template/área. Verificar catálogo após ativação.

## Autenticação e dependências do MA System

O código de autenticação, cookie ma_session, papéis, hash de senha e endpoints foi preservado. A separação do banco significa que usuários, sessões, senhas, administradores e histórico Neon NÃO existem automaticamente no banco comercial local.

- O mesmo cookie não implementa SSO entre bancos distintos. Tokens do MA System não serão reconhecidos pelo banco comercial.
- Em localhost, cookies não são isolados por porta. Evitar executar as duas aplicações no mesmo hostname com ma_session durante o teste; usar perfil de navegador separado. Alterar a estratégia de cookies requer decisão futura.
- Em produção, o site ainda declara o domínio `.maconfeccoes.com.br`; o MA System inspecionado usa cookie sem domínio. A estratégia de SSO/logout e escopo dos papéis precisa ser redesenhada antes de integrar ambientes separados.
- Links para `app.maconfeccoes.com.br` continuam externos; eles não transportam identidade autenticada de forma segura por si só.
- Integrações Baby/Mommy, licenças e demais modelos MA System não serão copiados. O e-commerce não depende desses modelos em seus serviços comerciais.
- A configuração de recuperação de senha recebe URL local pelo iniciador; nenhum e-mail real é enviado neste modo.

## Limites desta etapa

Nenhuma conexão, SQL, migration, geração de cliente, build ou deploy foi executado. `.env` original e MA System não foram alterados. A validação do banco vazio e a ativação das tabelas permanecem pendentes de autorização. O novo baseline muda a sequência de migrations do repositório: não utilizar esse diretório em qualquer banco existente/compartilhado.

## Estado posterior à autorização de inicialização

Em 14/10/2026, baseline e migration comercial foram aplicados exclusivamente no banco local protegido, após verificação de identidade, permissões e schema vazio. Histórico/checksums e 24 tabelas da aplicação + _prisma_migrations foram confirmados. Prisma Client 6.19.0 gerado. Não repetir scripts/init-local.cjs: o executor exige schema vazio e interromperá neste banco já inicializado. Nenhum administrador foi criado e o servidor não foi iniciado nesta operação. A validação funcional do painel permanece pendente.
