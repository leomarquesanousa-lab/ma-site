# Homologação isolada — preparação

## Inicialização validada e próximo ADMIN

O responsável confirmou no painel que o endpoint configurado pertence à branch homologation do projeto maconfeccoes. Servidor iniciado em http://127.0.0.1:3002 usando somente .env.homologacao, inclusive nos workers Next via homologation-preload.cjs. GET /, /cadastro e /login retornaram HTTP 200. Verificação HTTP não equivale à homologação visual ou à submissão dos formulários; nenhum formulário foi enviado nem usuário criado/promovido. .env principal preservado. Não houve migrations, seeds, build ou deploy.

Foi separado o carregador exclusivo do Next em scripts/next-env.cjs para evitar erro de empacotamento Turbopack ao importar o carregador de configuração no servidor da aplicação. O preload impede leitura automática de .env.local/.env nos processos filhos da homologação.

Cadastro disponível em http://127.0.0.1:3002/cadastro; login em /login. Cadastro real grava CUSTOMER e sessão apenas no banco isolado e deve ser feito pelo responsável quando desejar prosseguir, com nome/e-mail fictícios e senha digitada diretamente no formulário. Não enviar senha pelo chat.

Promoção futura, ainda NÃO executada: informar o e-mail exato e autorizar promover UMA conta CUSTOMER para ADMIN na homologation. Preparar então executor específico que carrega somente .env.homologacao, revalida o hostname isolado e neondb/public, exige confirmação interativa, encontra exatamente uma conta CUSTOMER e, numa transação, atualiza somente seu role/updatedAt e registra AuditLog com actorId de bootstrap claramente identificado. Não criar/alterar senha, promover conta ambígua ou tocar em outros usuários. Se mustChangePassword estiver ativo, concluir a troca pelo fluxo normal; não desativar essa proteção. Não reaproveitar promote-local-admin.cjs nem executar SQL genérico na produção. Após promoção, entrar novamente e verificar /admin; sem autorização a etapa fica bloqueada.

Nenhuma branch, banco, conta, migration ou upload foi criado/executado nesta preparação. `.env` definitivo preservado; `.env.local` não participa. Sem conexão ao banco definitivo nesta etapa.

## Configuração pelo responsável

Recomendado: criar MANUALMENTE, após autorização, uma branch `homologacao` dentro do projeto Neon maconfeccoes, a partir do estado atual vazio com as três migrations concluídas. Não usar outro projeto ou o MA System. Uma branch Neon criada do estado atual herda schema/histórico: não reaplicar SQL manualmente. Confirmar branch/projeto no painel e fornecer seu endpoint exclusivo; hostname diferente sozinho não comprova identidade da branch. Se o banco isolado nascer sem estrutura, autorizar separadamente as três migrations em ordem.

Criar `.env.homologacao` localmente (ignorado pelo Git), sem copiar o DATABASE_URL definitivo. Obter a conexão da branch no painel. Conteúdo necessário, com valores reais somente no arquivo privado:

```dotenv
MA_RUNTIME=homologation
HOMOLOGATION_NEON_HOST=HOSTNAME_DA_BRANCH_ISOLADA
DATABASE_URL=CONEXAO_DA_BRANCH_ISOLADA
ASSET_STORAGE=r2
R2_BUCKET=maconfeccoes
R2_ACCOUNT_ID=CONFIGURAR_PRIVADAMENTE
R2_ACCESS_KEY_ID=CONFIGURAR_PRIVADAMENTE
R2_SECRET_ACCESS_KEY=CONFIGURAR_PRIVADAMENTE
R2_TEST_PREFIX=homologacao/ensaio-20261015
```

Não incluir SMTP_/EMAIL_ nem configurações reais de pagamento/webhooks. O arquivo é carregado sozinho, sem merge com .env, sem .env.local e sem colocar segredos em NEXT_PUBLIC_. O iniciador exige endpoint Neon diferente tanto do definitivo quanto do endpoint antigo bloqueado, banco neondb/public, TLS estrito e CA pública existente. Não iniciar Next diretamente nem definir MA_RUNTIME=production para testes locais.

## Iniciar após configuração e autorização

```powershell
node scripts/dev-homologation.cjs --check
node scripts/dev-homologation.cjs
```

`--check` é somente configuração, sem rede. O segundo comando inicia em http://127.0.0.1:3002. A partir daí ações de navegador PODEM gravar no banco de testes; não foi executado nesta preparação. O iniciador não cria estrutura/usuários e não executa seed/migrations/uploads. `dev:local`, Prisma padrão e executor de migrations de produção mantêm seus guardas. A flag explícita MA_HOMOLOGATION seleciona o arquivo próprio também nos workers Next; sem ela, continua sendo .env.

## Estrutura e administrador — próxima tarefa autorizada

1. Confirmar identidade da branch no painel e conferir histórico SOMENTE no destino isolado. Se herdou as três migrations, não há migrations iniciais pendentes.
2. Se vazio, preparar executor específico para esse hostname isolado, com as mesmas verificações de checksum, TLS e confirmação do executor existente. **Não usar neon-migrate.cjs para a branch**: ele é fixado no destino definitivo. Prisma CLI padrão também continua bloqueando destinos remotos. Não existe comando remoto de migrations da homologação liberado nesta etapa.
3. Autorizar explicitamente a criação/promoção de UMA conta fictícia de teste, com senha única, hash pelo bcrypt existente e auditoria, somente nessa branch. Não reutilizar promote-local-admin.cjs: ele é fixado no PostgreSQL local. Nenhuma conta foi criada; bootstrap específico permanece pendente dessa autorização.
4. Confirmar que configurações comerciais estão desativadas inicialmente. Autorizar dados fictícios pelo painel, nunca clientes/referências reais nem importação de produção. Para testar pedidos, habilitar orderingEnabled somente na branch mediante autorização; conferir frete/pagamento manual e ausência de cobranças/integradores reais.

## Arquivos R2

O adaptador existente é reutilizado. Uploads futuros usam `public/homologacao/ensaio-20261015/...` ou `private/homologacao/ensaio-20261015/...`. GET/PUT em modo homologação recusam chaves fora do prefixo configurado. Originais privados continuam sob autorização de arquivos existente. Não executar limpeza automática; qualquer remoção futura exige inventário e autorização específica.

Preferir token de testes restrito no provedor quando disponível; a guarda de prefixo da aplicação não reduz os privilégios reais de uma credencial do bucket. O bucket continua compartilhado: não alterar política de acesso ou lifecycle global. Produtos herdados com referências fora do prefixo não terão suas imagens lidas nesse modo; usar somente fixtures novas. Não reaproveitar namespace com dados de outro ensaio.

## Roteiro real de navegador (a executar depois, não simulado como aprovado)

1. Login: confirmar credencial inválida recusada, sessão administrativa válida e rotas administrativas negadas sem login. Não desativar autenticação.
2. Categorias: criar `HML Canecas` e `HML Camisetas`; testar seletor, drag-and-drop e URL HTTPS; miniatura, troca/remoção, persistência e exibição pública. Testar MIME/tamanho inválidos. URL externa faz requisição do navegador ao host: usar somente imagem própria de teste.
3. Produtos: criar caneca/camiseta fictícias, conferir slug/SEO gerados conforme comportamento existente, colisão de slug, categoria, preço, publicação e variantes. Registrar divergências; não considerar recursos aprovados antecipadamente.
4. Artes: upload de arte própria/licenciada, tema/tags/compatibilidade; conferir original privado negado sem autorização e miniatura acessível conforme configuração.
5. Caneca: configurar mockup/área física, adicionar imagem/texto, camadas, salvar/reabrir e conferir composição. Prévia é 2D; exportação industrial continua pendente de validação.
6. Camiseta: configurar frente/costas, áreas físicas, cor/tamanho; conferir limites, rotação, camadas, resolução efetiva e persistência.
7. Carrinho/pedido: com usuário fictício, quantidade/variante/design corretos, persistência, item de pedido vinculado à composição e bloqueios de estoque. Não efetuar pagamentos reais; conferir arte antes de produção.
8. R2: verificar referências persistentes com prefixo do ensaio, leitura após reiniciar o servidor, original privado protegido e falha de upload sem referência inválida. Somente nessa tarefa futura executar uploads.
9. Conferir no destino definitivo apenas em tarefa futura de leitura autorizada que não houve novos registros; não repetir testes de conexão agora.

Pendências: criação manual da branch e confirmação de identidade; arquivo privado de homologação; autorização de bootstrap/dados/ações de escrita; teste HTTP/visual real. Preparação não garante funcionamento do Next ou dos fluxos completos antes desses testes. Manter volume/ACL seguros, pois o histórico da branch é isolado mas deriva do projeto; não usar dados pessoais reais.
