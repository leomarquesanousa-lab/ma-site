# Estúdio MA — entrega local de 15/10/2026

Evolução do personalizador 2D existente. Escopo: canecas e camisetas. Nenhuma dependência nova. Não houve acesso a banco, Neon, MA System ou R2, migration aplicada, build completo, deploy ou commit.

## Funcionalidades implementadas no código

1. Biblioteca: cadastro administrativo de arte, tema/categoria, subcategoria, tags, pesquisa, compatibilidade MUG/SHIRT, ativação, origem e direitos obrigatórios. Upload usa o storage existente (R2 ou local), preserva o original privado e cria miniatura WebP pública de até 480 px. Nenhuma arte de terceiros foi incluída.
2. Modelos simples: uma arte de fundo e até dez textos opcionais. O administrador pode bloquear cada camada de texto, preservando conteúdo, posição, dimensões, fonte e cor. A API rejeita alterações e ausência de camadas obrigatórias do modelo. É possível remover o modelo inteiro da área. Não é um editor administrativo arbitrário de composições.
3. Editor: ferramentas à esquerda, mockup central, ajustes à direita em telas largas; mockup primeiro e painéis abaixo no mobile. Ícones SVG locais, foco visível, áreas de toque de 44 px e respeito à preferência de movimento reduzido.
4. Biblioteca por temas e busca por nome/subtema/tags; upload próprio; texto, quatro fontes do sistema e cor; camadas por vista, ordem, duplicação, exclusão, posição, largura, altura, rotação e centralização horizontal/vertical.
5. Histórico de até 50 estados; arraste agrupado em uma operação de desfazer. Toque e setas do teclado (Shift aumenta o passo). Limites de área incluem a caixa rotacionada e são validados novamente no servidor.
6. Vistas independentes no mesmo projeto, sem apagar artes ao trocar de vista. Frente/costas de camiseta e vistas de caneca são templates cadastrados. Mockups podem ser limitados a variantes específicas; seleção vazia significa todas. A seleção de cor/tamanho continua usando as variantes existentes.
7. Salvar cria um novo projeto imutável, com composição e snapshot schemaVersion 2, vistas, dimensões, metadados dos originais, licença/revisão da arte e manifesto em mm. Projetos antigos não são regravados. Reabertura e continuidade para o carrinho existentes foram mantidas.
8. DPI efetivo conservador, calculado com pixels do original, escala e medidas reais. Referências: abaixo de 150 DPI gera alerta; abaixo de 300 DPI pede conferência. São referências de qualidade, não garantia de adequação ao processo de impressão.
9. Pedido mantém o snapshot definitivo por item, incluindo ID do projeto e todas as vistas. Ficha JSON disponível ao administrador em cada item, com links autenticados dos originais. Entrar em PRODUCTION exige confirmação explícita da conferência de arte para pedidos personalizados e registra a nota no histórico.

## Arquivos alterados / adicionados

- `components/commerce/Personalizer.tsx`, `ProductPurchase.tsx`, `ArtworkAdmin.tsx` (novo), `AdminWorkspace.tsx`, `client.ts`.
- `lib/commerce/artwork.ts` (novo), `production.ts` (novo), `validation.ts`, `admin.ts`, `service.ts`.
- `app/commerce.module.css`, `app/produtos/[slug]/page.tsx`.
- `app/api/commerce/[...path]/route.ts`, `app/api/uploads/route.ts`, `app/api/arquivos/[id]/route.ts`.
- `prisma/schema.prisma`, `prisma/migrations/202610150001_studio/migration.sql` (nova, não aplicada).
- `scripts/check-studio.cjs` (novo), este documento e `docs/checkpoints/STUDIO_2026-10-15.md`.

## Configuração necessária

- Revisão operacional e aplicação futura da migration por operador autorizado. O novo código depende das novas colunas/tabela; não ativar sobre banco sem esse schema.
- Templates antigos recebem UNCONFIGURED. No admin, classificar cada vista como caneca/camiseta preserva seus IDs e suas áreas. Essa classificação não altera a imagem-base nem as referências dos projetos antigos. Produtos de outras modalidades não entram no estúdio.
- Cadastrar mockups, áreas normalizadas e medidas reais positivas em mm. A imagem é ajustada em um canvas quadrado com `object-fit: contain`; as áreas usam coordenadas desse canvas, incluindo possíveis margens da imagem. Validar os limites sobre cada imagem-base.
- Criar variantes com cor/tamanho e associar vistas às variantes quando o mockup variar por cor. Usar nomes claros: Frente, Costas, Caneca frontal, Caneca lateral. A mudança de cor depende de imagem-base cadastrada, sem recoloração automática.
- Cadastrar somente artes próprias ou licenciadas e documentar origem e autorização comercial. O cadastro não verifica juridicamente a licença. Miniaturas são públicas; desativar retira da seleção, mas não revoga URLs públicas já conhecidas nem remove snapshots de pedidos.
- Configuração R2 existente e autenticação/permissões comerciais. Biblioteca e projetos exigem login. Limites existentes de upload de 5 MB, 100 MB por usuário e quota por minuto permanecem, contabilizando os arquivos de miniatura.
- Arquivos anteriores não têm pixels preenchidos automaticamente; DPI fica indisponível até revisão dos metadados ou novo upload. Nenhum backfill foi executado.

## Limitações e pendências para produção

- Mockup exclusivamente 2D: não simula 3D, curvatura da caneca, perspectiva, tecido, fidelidade de cor ou cobertura de impressão. Vistas de caneca são composições independentes; não há projeção automática de uma arte panorâmica entre as vistas.
- A ficha JSON prepara fontes, medidas, escala e composição; NÃO é PNG/PDF de alta resolução pronto para impressão. Exportação industrial permanece `PENDING_INDUSTRIAL_VALIDATION`. Nunca usar a miniatura ou captura do mockup como original de produção.
- Homologar um renderizador industrial com orientação EXIF, proporção entre canvas e medidas reais, tipografia, rotação, sangria, perfil de cor, resolução exigida pelo fornecedor e dimensões de saída. Fontes do sistema podem variar entre dispositivos; textos precisam ser conferidos e futuramente ter fontes controladas/embutidas.
- Conferência humana registrada não certifica a exportação. Revisar todas as vistas e arquivos antes de produzir. `artReview: PENDING` no manifesto é o estado no salvamento; a confirmação posterior fica no histórico/auditoria do pedido.
- Presets simples têm posicionamento padrão; não há posicionamento visual administrativo. Categorias/subcategorias são rótulos de cadastro, sem árvore administrativa separada. Busca cobre até 200 artes retornadas pela API; paginação é evolução futura.
- Reabertura de projetos cujas áreas foram substituídas é bloqueada com orientação à loja; original e snapshot continuam preservados. Não há migração automática de composição para novas áreas.
- Homologação no navegador e ponta a ponta não foi executada, pois demandaria ambiente configurado e banco. Layout responsivo está implementado, mas ainda requer conferência visual em dispositivos reais.
- Reutilizadas as políticas existentes de retenção e arquivos órfãos; não há limpeza física automática nesta etapa.

## Validação com uma caneca e uma camiseta

Somente depois da ativação autorizada do schema em ambiente isolado:

1. No admin, cadastrar uma caneca personalizável e uma camiseta personalizável com variantes ativas (camiseta: duas cores e dois tamanhos). Classificar ou cadastrar as vistas MUG/SHIRT. Definir medidas em mm e área dentro do mockup. Para cores diferentes, associar cada mockup às variantes correspondentes.
2. Caneca: cadastrar duas vistas, por exemplo frontal e lateral. Como exemplo apenas, usar uma área real de 200 × 90 mm se compatível com o produto/processo da loja. Cadastrar uma arte própria, licença/origem e miniatura; marcar compatibilidade com caneca.
3. Camiseta: cadastrar Frente e Costas, por exemplo 280 × 350 mm se aprovado pela produção. Ativar uma arte compatível com camiseta e um modelo com texto editável e outro com conteúdo bloqueado.
4. Entrar como cliente. Pesquisar arte, inserir modelo, enviar original próprio de boa resolução e outra imagem pequena. Conferir alertas de DPI ao variar a escala. Verificar que camada bloqueada não pode ter texto, posição, tamanho, cor ou fonte alterados; remover o modelo inteiro deve continuar possível.
5. Arrastar e rotacionar contra as bordas; não deve ultrapassar a área. Ajustar fonte/cor, centralizar, duplicar, reordenar, excluir, desfazer e refazer. Editar por toque e teclado. Conferir larguras de 390 px e 1280 px sem rolagem horizontal.
6. Adicionar elementos em ambas as vistas e alternar entre elas; nenhuma arte deve desaparecer. Salvar, reabrir e verificar conteúdo de todas as vistas. Trocar variante com alteração não salva deve avisar sobre descarte.
7. Adicionar ao carrinho e criar pedido usando o fluxo já existente. Salvar outra composição depois: o snapshot do pedido anterior deve permanecer igual.
8. Como administrador, baixar a ficha JSON de cada item. Conferir schemaVersion 2, vistas, unidades mm, referências dos originais e status pendente da exportação industrial. Abrir os links autenticados e conferir que o arquivo de produção é o original, não a miniatura.
9. Como cliente diferente ou visitante, tentar abrir um original privado: deve retornar 404. Como operador autorizado, acessar somente originais vinculados a pedidos. Desativar uma arte e conferir que ela sai da biblioteca, mantendo os pedidos existentes.
10. Tentar levar o pedido personalizado de CONFIRMED a PRODUCTION sem marcar conferência: deve falhar. Conferir arte, dimensões e originais, marcar a confirmação e repetir; verificar registro no histórico.

## Evidências offline

- Schema Prisma validado e cliente gerado offline com os binários já instalados, sem carregar `.env.local` ou abrir conexão.
- TypeScript dos módulos comerciais e análise CSS: zero diagnósticos.
- Checks de domínio existentes passaram.
- `node scripts/check-studio.cjs`: geometria, fonte permitida, duplicidade de IDs, DPI/mm, snapshot de duas vistas, proteção de original, rejeição de metadados falsificados, arte indisponível, vista incompatível, camadas bloqueadas ausentes/adulteradas e conferência obrigatória antes da produção. Banco, storage e autenticação substituídos por fixtures em memória.
- Nenhum teste visual ou operacional real foi alegado.
