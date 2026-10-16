# CHECKPOINT ATUAL — MA Confecções

Data: 15/10/2026. Projeto: `C:\Projetos\ma-site`. Branch: `develop/ma-commerce`. Modo econômico. Commit local solicitado: `checkpoint: ma commerce e personalizador caneca 3d`.

Este é o ponto de continuidade atual. Documentos datados registram etapas históricas e podem conter pendências posteriormente resolvidas (inclusive referências antigas a `.env.local`, migrations ainda não aplicadas e ausência de 3D). Não usar esses trechos históricos para desfazer o isolamento ou inferir o estado atual dos serviços. Nenhum serviço remoto foi consultado neste checkpoint.

## Estrutura e tecnologias

- Next.js 16.3.2/App Router/Turbopack, React 19.2.8, TypeScript e CSS Modules.
- Prisma Client/Prisma 6.19, PostgreSQL Neon, autenticação por sessão e permissões existentes; bcrypt para senhas.
- Cloudflare R2 pelo adaptador existente, originais privados separados de miniaturas públicas.
- Three.js 0.186.1 e tipos 0.186.0. Sem React Three Fiber/Drei nesta prova de conceito.
- Rotas em `app/`, interface em `components/commerce/`, domínio em `lib/commerce/`, executores em `scripts/`, schema/migrations em `prisma/`, documentação em `docs/`.

## Site e administração implementados

- Homepage premium com carrossel de cinco slides: uniformes, almofadas, camisetas, canecas e azulejos. Banners públicos próprios em `public/`; navegação manual/automática, pausa e tratamento de movimento reduzido.
- Catálogo, coleções, página do produto com galeria principal/miniaturas/ampliação, variantes, orçamento, carrinho e pedidos existentes.
- Formulário único de produto: dados, preço, imagens, variantes, estoque, SEO e mockups; rascunho/publicação, transação e validações. Arquivos enviados não são apagados automaticamente após falha de cadastro.
- Slug e SEO automáticos de produtos/categorias, preservando edição manual e slugs existentes. Metadados usados nas páginas públicas; keywords auxiliares.
- Imagens de categoria/produto com upload, drag-and-drop, seleção e URL externa validada. Reutiliza serviço de armazenamento e autorização existentes.
- Clientes: lista compacta padrão, grade opcional, preferência de sessão, busca nome/e-mail, filtros de pedidos, ordenação e paginação de 20; detalhes cadastrais e histórico comercial limitado, sem dados de autenticação.
- Biblioteca de artes com temas/tags/compatibilidade, origem/direitos, miniatura e original protegido; presets textuais editáveis/bloqueados conforme configuração.
- Mockup administrativo separado de fotos comerciais, por produto/variante/vista, com desenho/movimento/redimensionamento visual da área e medidas reais em mm. Sem mockup válido, mantém estado vazio; publicação personalizada possui bloqueios existentes.

Implementação não significa homologação visual completa. Ver registros de testes e limitações abaixo.

## Ambientes, Neon e TLS

- Projeto Neon confirmado pelo responsável: `maconfeccoes`, database `neondb`, schema `public`.
- Produção: `.env`, preservado e não versionado. Endpoint aprovado identificado nos scripts de guarda; não conectar para testes locais nem usar MA System.
- Homologação: branch `homologation`, conexão exclusiva em `.env.homologacao`, ignorado pelo Git. Identidade do endpoint confirmada anteriormente pelo responsável no painel Neon. Não copiar credenciais de produção.
- `.env.local` permanece fora do fluxo de execução. Carregadores explícitos e preload impedem sobreposição dos ambientes, inclusive em workers Next.
- Inicialização segura: `node scripts/dev-homologation.cjs --check` e, quando necessário, `node scripts/dev-homologation.cjs`. Porta 3002, acessar `http://localhost:3002`; usar login normal, sem extrair/reutilizar tokens do banco.
- `dev:local` e Prisma CLI preservam bloqueios contra Neon remoto e operações destrutivas. Executores remotos exigem destino explícito, checksums, backup/manifesto e confirmação; não usá-los para iniciar homologação.
- TLS estrito e certificado público confiável `prisma/certs/neon-root-ca.pem`; não contém chave privada. Não desabilitar SSL ou validação de certificado.
- Último estado confirmado: três migrations iniciais aplicadas, 25 tabelas de aplicação mais histórico; Client 6.19 gerado. Não houve nova consulta, geração ou migration neste checkpoint.
- Migration de SEO de categorias aplicada anteriormente somente na homologação: `202610150002_category_seo`. Produção exige rollout separado e autorizado antes de receber código/schema que dependa dessas colunas. Não reaplicar migrations automaticamente.
- Backups/manifests ficam em diretórios privados ignorados. Documentos históricos de backup não substituem backup recente e verificado para uma futura operação.

## R2

Bucket correto: `maconfeccoes`, sem hífen; fonte `R2_BUCKET`, sem fixação incorreta de nome. Autenticação, metadados e teste controlado de upload/leitura/remoção foram validados anteriormente; não repetidos aqui. Homologação exige namespace `R2_TEST_PREFIX` próprio, com guardas de leitura/escrita. Credenciais do bucket podem ter privilégios maiores que essa guarda: preservar isolamento, políticas e arquivos definitivos.

`.env`, `.env.homologacao`, `.env.local`, backups, inventários, armazenamento privado e cache temporário ficam fora do commit. Não publicar originais privados, arquivos particulares de clientes, senhas, tokens ou chaves privadas.

## Personalizador 2D e caneca 3D

- O editor 2D continua sendo a fonte da composição: imagens/texto, oito alças de transformação livre, Shift proporcional, rotação, arraste, snapping, ajuste fino, camadas, bloqueios, desfazer/refazer e múltiplas vistas.
- Imagem-base e área cadastradas são obrigatórias; não usa foto comercial ou outro produto como fallback.
- Composição JSON inclui IDs de produto/variante/vista/área, geometria, vínculos com arte e originais, modo de aplicação, crop normalizado e cor de fundo quando aplicável.
- Caneca experimental real em WebGL/Three.js: corpo com espessura/interior/fundo, alça, materiais cerâmicos, luz de estúdio, sombras, UV, controles de órbita horizontal 360°, zoom limitado, mouse/toque e teclado. 4.160 triângulos na geometria testada.
- Carregamento sob demanda, renderização orientada a mudanças, DPR limitado, preferência por movimento reduzido e descarte de recursos. Sem WebGL, mostra indisponibilidade/fallback identificado; não simula sucesso gráfico.
- Demonstração original protegida: `/admin/demo-caneca-3d`. Biblioteca integrada está no projeto da página do produto, que fornece variante/áreas e salvamento.
- Integração 3D habilitada somente pelo servidor de homologação e em canecas com configuração 2D válida. O modelo é experimental, não associação definitiva nem reprodução exata de todos os SKUs.

## Artes prontas, full wrap e composição segura

- Clique na miniatura aplica automaticamente a arte à composição e atualiza a textura 3D. Outra arte substitui as camadas de biblioteca da mesma área/vista, preservando textos/uploads manuais e outras vistas. Nova imagem de fundo fica sob textos existentes.
- O padrão indiscriminado FULL_WRAP foi substituído por **Automático**, com três modos explícitos:
  - **FULL_WRAP_COVER**: fotos/estampas identificadas, ocupa quase toda a área e permite crop; FULL_WRAP legado continua aceito.
  - **SAFE_CONTAIN**: imagem inteira, sem crop, centralizada com margens. Sobras recebem cor predominante das bordas da própria arte.
  - **CENTERED**: logo/aplicação localizada.
- Heurísticas: nome/tema/tags, presets textuais, proporção, transparência e bounding box amostrados em 64×64. Texto/layout/banner ou conteúdo desconhecido favorecem SAFE_CONTAIN; logo isolado favorece CENTERED; fotografia/estampa explicitamente identificada ou nome típico de câmera pode usar COVER. JPEG por si só não prova fotografia.
- Não há OCR ou reconhecimento semântico garantido. O usuário pode corrigir o modo. Não remover automaticamente partes da imagem com base em bounding box.
- Pipeline atual gera **prancheta intermediária por área**, respeitando proporção física quando há medidas, fundo, margens, conteúdo, crop e camadas. Depois ajusta a prancheta ao atlas sem forçar deformação e atualiza CanvasTexture sem recriar toda a cena.
- Mapeamento amplo no corpo da caneca, com costura junto à alça e segurança em borda/base. A preservação da proporção pode reduzir cobertura angular em relação aos parâmetros anteriores de full wrap; não voltar à distorção para preencher largura a qualquer custo.
- Imagens da textura são carregadas pelo endpoint autorizado com sessão normal. Não publicar original privado nem salvar textura de preview como arquivo industrial. A miniatura da biblioteca continua sendo prévia; servidor associa o original ao projeto.
- Crop em FULL_WRAP pode ser reposicionado; SAFE_CONTAIN não admite crop no validador. Modo/fundo/crop são persistidos no JSON existente, sem novos campos Prisma.

## Salvamento, reabertura e produção

O fluxo de API de salvamento/reabertura existente permanece integrado à composição. O validador aceita os modos atuais e metadados, preserva compatibilidade legada e rejeita crop inválido/no modo seguro. Originais e snapshots por vista continuam associados ao projeto; carrinho/pedido usam os vínculos existentes.

**A persistência real após salvar/reabrir as personalizações com os novos modos ainda precisa de validação autenticada no navegador.** Testes de round-trip JSON/validador em memória não comprovam esse fluxo no banco. Não houve novas gravações remotas nas etapas recentes do personalizador ou neste checkpoint.

DPI considera o eixo mais esticado e os pixels restantes após crop. Manifesto de produção inclui medidas, referências originais, modo, crop e fundo. Exportação industrial continua `PENDING_INDUSTRIAL_VALIDATION`, com conferência de arte pendente; não tratar mockup/miniatura como original pronto para impressão.

## Testes realizados e limites da evidência

- Histórico documentado de conexão TLS, R2, aplicação inicial de migrations e geração do Client; não repetido neste checkpoint.
- Testes anteriores de APIs/HTTP de categorias/SEO/upload e cadastro/publicação transacional de produtos fictícios na homologação estão registrados em `SEO_HOMOLOGATION.md` e `PRODUCT_EDITOR_CHECKPOINT.md`. Isso não homologa visualmente o novo estúdio.
- TypeScript direcionado, análise CSS e testes em memória de listagem, paginação, filtros, seleção e renderização estática.
- Transformação: limites/ancoragem, rotações, oito alças, recorte, snapping, proporções e histórico em contratos/cálculos testados.
- 3D: geometria/UVs/materiais/descarte, proteção da rota, configuração isolada e renderização estática; não equivalem a execução WebGL visual.
- Composição segura: quatro cenários fictícios — Feliz Aniversário, foto romântica, logo e estampa —, margens, contain sem crop, cor de fundo, proporção física, prancheta, desenho da fonte inteira, validação JSON e DPI.
- Sem navegador conectado nas últimas verificações. **A aparência real das artes, a rotação 3D e a persistência após salvar/reabrir ainda precisam de validação no navegador.** Também pendentes toque/mobile, WebGL em dispositivos reais, FPS/memória e fluxo completo até carrinho/pedido.
- Este checkpoint executa apenas inspeção Git, conferência dos candidatos a commit e documentação. Sem build, migrations, banco, R2, reinício de servidor ou testes de conectividade.

## Prioridades para a próxima sessão

1. Login normal em homologação; conferir biblioteca e os quatro cenários com imagens próprias/licenciadas, desktop/mobile, giro, alça, texto inteiro e fundos.
2. Salvar/reabrir e comparar modos, crop, fundo, elementos, vistas, variante e DPI; testar desfazer/refazer e acesso autorizado aos arquivos. Usar somente dados fictícios autorizados.
3. Conferir carrinho/pedido com snapshot do projeto, sem pagamento real e sem produção automática.
4. Calibrar dimensões físicas e UV por produto/modelo; unir vistas quando explicitamente configurado. Não associar automaticamente modelo genérico a todo catálogo.
5. Validar exportação industrial e conferência de arte; planejar camiseta 3D somente depois da aprovação da caneca.
6. Antes de qualquer rollout, resolver separadamente a migration SEO em produção, backup recente e demais configurações comerciais. Nenhuma autorização de deploy está implícita.

## Versionamento deste checkpoint

Preparar somente arquivos pertinentes ao projeto, após conferir os candidatos. Inclui código, scripts necessários, migrations já existentes/preparadas, documentação, banners públicos do site e a CA pública necessária ao TLS. Exclui arquivos de ambiente, segredos, chaves privadas, backups, caches e imagens particulares de clientes. Não executar push.

O inventário abaixo registra os 111 arquivos pendentes encontrados antes da criação deste documento. Somado a `docs/CHECKPOINT_ATUAL.md`, o checkpoint prepara 112 arquivos. O hash deve ser obtido por `git log -1 --format=%H` após o commit; não incluir autorreferência impossível no conteúdo do próprio commit.

## Inventário dos arquivos pendentes

- `.gitignore`
- `app/admin/admin.module.css`
- `app/admin/demo-caneca-3d/page.tsx`
- `app/api/arquivos/[id]/route.ts`
- `app/api/commerce/[...path]/route.ts`
- `app/api/uploads/route.ts`
- `app/colecoes/[...segmentos]/page.tsx`
- `app/commerce.module.css`
- `app/page.tsx`
- `app/premium.module.css`
- `app/produtos/[slug]/page.tsx`
- `components/HeroCarousel.tsx`
- `components/commerce/AdminListLayout.module.css`
- `components/commerce/AdminListLayout.tsx`
- `components/commerce/AdminWorkspace.tsx`
- `components/commerce/ArtworkAdmin.tsx`
- `components/commerce/Catalog.tsx`
- `components/commerce/CategoryImageField.module.css`
- `components/commerce/CategoryImageField.tsx`
- `components/commerce/CustomersWorkspace.module.css`
- `components/commerce/CustomersWorkspace.tsx`
- `components/commerce/ElementArtwork.tsx`
- `components/commerce/FeaturedProducts.tsx`
- `components/commerce/MockupAreaEditor.module.css`
- `components/commerce/MockupAreaEditor.tsx`
- `components/commerce/MockupArtwork.tsx`
- `components/commerce/MugDemo.module.css`
- `components/commerce/MugDemo.tsx`
- `components/commerce/MugDemoViewer.tsx`
- `components/commerce/Personalizer.tsx`
- `components/commerce/ProductCompositionFields.tsx`
- `components/commerce/ProductGallery.module.css`
- `components/commerce/ProductGallery.tsx`
- `components/commerce/ProductPurchase.tsx`
- `components/commerce/StructuredField.tsx`
- `components/commerce/client.ts`
- `docs/CLIENTS_STUDIO_USABILITY.md`
- `docs/CONNECTIONS_2026-10-15.md`
- `docs/ENV_ONLY.md`
- `docs/HOMOLOGATION.md`
- `docs/INITIAL_HOMOLOGATION_2026-10-15.md`
- `docs/MOCKUP_CONFIGURATION.md`
- `docs/MUG_3D_PHASE1.md`
- `docs/MUG_FULL_WRAP.md`
- `docs/MUG_SAFE_COMPOSITION.md`
- `docs/NEON_ACTIVATION_2026-10-15.md`
- `docs/NEON_MIGRATION_RUNBOOK.md`
- `docs/NEON_SCHEMA_DIAGNOSTIC_2026-10-15.md`
- `docs/PRODUCT_EDITOR_CHECKPOINT.md`
- `docs/PRODUCT_STUDIO_LAYOUT.md`
- `docs/R2_PRODUCTION.md`
- `docs/READY_ART_MUG_3D.md`
- `docs/SEO_HOMOLOGATION.md`
- `docs/STUDIO.md`
- `docs/checkpoints/STUDIO_2026-10-15.md`
- `lib/commerce/admin.ts`
- `lib/commerce/artwork.ts`
- `lib/commerce/category-seo.ts`
- `lib/commerce/currency.ts`
- `lib/commerce/customers.ts`
- `lib/commerce/editor-metadata.ts`
- `lib/commerce/mockups.ts`
- `lib/commerce/mug-art-analysis.ts`
- `lib/commerce/mug-composition-texture.ts`
- `lib/commerce/mug-demo-model.ts`
- `lib/commerce/neon.ts`
- `lib/commerce/production.ts`
- `lib/commerce/r2.ts`
- `lib/commerce/ready-art-layout.ts`
- `lib/commerce/service.ts`
- `lib/commerce/storage.ts`
- `lib/commerce/studio-geometry.ts`
- `lib/commerce/validation.ts`
- `lib/db.ts`
- `next.config.ts`
- `package-lock.json`
- `package.json`
- `prisma.config.ts`
- `prisma/certs/neon-root-ca.pem`
- `prisma/homologation-migrations/202610150002_category_seo/migration.sql`
- `prisma/migrations/202610150001_studio/migration.sql`
- `prisma/neon-activation-plan.json`
- `prisma/schema.prisma`
- `public/hero-azulejo.png`
- `public/hero-camiseta.png`
- `public/hero-caneca.png`
- `public/hero_almofadas.png`
- `scripts/check-editor-metadata.cjs`
- `scripts/check-mockup-editor.cjs`
- `scripts/check-neon-migration-executor.cjs`
- `scripts/check-neon-readonly.cjs`
- `scripts/check-product-editor.cjs`
- `scripts/check-r2-live.cjs`
- `scripts/check-studio.cjs`
- `scripts/dev-homologation.cjs`
- `scripts/dev-local.cjs`
- `scripts/homologation-category-seo.cjs`
- `scripts/homologation-env.cjs`
- `scripts/homologation-preload.cjs`
- `scripts/init-local.cjs`
- `scripts/local-env.cjs`
- `scripts/neon-backup.cjs`
- `scripts/neon-migrate.cjs`
- `scripts/neon-migration-plan.cjs`
- `scripts/neon-restore-rehearsal.cjs`
- `scripts/next-env.cjs`
- `scripts/next-env.d.cts`
- `scripts/project-env.cjs`
- `scripts/project-env.d.cts`
- `scripts/promote-local-admin.cjs`
- `scripts/run-next.cjs`
