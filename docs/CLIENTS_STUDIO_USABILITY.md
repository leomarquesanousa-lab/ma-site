# Clientes e estúdio — checkpoint de usabilidade

## Implementação

- Clientes: mantém paginação de 20 itens, busca e filtros existentes. Nome clicável, linha selecionada destacada, tabela e grade menores. Detalhes laterais no desktop; painel sobreposto abaixo de 1100 px, com fechamento e retorno do foco.
- Estúdio: arrastar, oito alças para transformação livre; Shift preserva proporção, alça de rotação e snapping opcional. Controles numéricos ficam em “Ajuste fino”. Alças também aceitam setas; Shift acelera rotação. Um gesto corresponde a uma etapa do histórico.
- Configuração administrativa: quatro cantos para redimensionar a área imprimível, além do desenho e movimento existentes.
- Prévia: caneca com projeção cilíndrica horizontal de 96 faixas SVG; camiseta com projeção plana. Recorte na área cadastrada, máscara alfa da arte, mistura multiply e sombra sutil. A transformação é somente visual; composição salva, coordenadas e DPI continuam planos.

## Limitações

É uma prévia 2D ilustrativa, sem geometria 3D, reconhecimento de contorno, simulação de tecido ou garantia de curvatura real. A qualidade depende da imagem-base e da área configuradas pelo operador. SVG com `foreignObject`, referências `use` e mistura de cores ainda precisa de conferência visual nos navegadores de destino. Nenhuma foto comercial é convertida automaticamente em mockup. Regras existentes de variante/vista e publicação permanecem intactas.

## Verificações realizadas

- TypeScript direcionado: zero erros.
- Quatro folhas CSS analisadas sem erros de sintaxe.
- Geometria: 73 ângulos, limites após rotação, escala livre/proporcional, arraste, resize, rotação, snapping e monotonicidade da projeção cilíndrica.
- Renderização estática em memória: máscara/recorte, projeção de caneca e camiseta, exclusão de elementos de outras áreas, ações de lista/grade e seleção.
- `node scripts/dev-homologation.cjs --check`: configuração isolada válida, sem `.env` e `.env.local`.
- HTTP local sem sessão: listagem e detalhes de clientes retornam 401; `/admin` redireciona (307).
- Nenhum navegador conectado disponível. Não houve validação visual nem teste autenticado de persistência nesta etapa. Nenhum registro ou arquivo remoto foi criado/modificado.

## Próxima validação — somente homologação

1. Iniciar com `node scripts/dev-homologation.cjs` e entrar pelo login normal em `http://localhost:3002`.
2. Em Clientes, buscar nome/e-mail de cliente existente, ordenar, paginar, alternar Lista/Grade e abrir/fechar detalhes no desktop e mobile. Não criar clientes para este teste sem autorização.
3. No produto configurado, abrir o estúdio, inserir arte/texto, mover, ajustar largura/altura pelos lados e cantos e girar pela alça. Verificar limites, snapping, teclado e desfazer/refazer.
4. Conferir a Prévia de caneca e camiseta, frente/costas, bordas da área e legibilidade do texto. Confirmar mockups exclusivos ao trocar variante/vista e o estado vazio quando não configurados.
5. Com dados fictícios e sessão normal de homologação, salvar, reabrir e conferir as vistas e o DPI. Verificar carrinho sem finalizar pedido nesta conferência.
6. No formulário único do produto, em Mockup de personalização, conferir desenho, movimento e os quatro cantos da área, sem publicar alterações involuntárias.

## Correção de free transform

Oito alças, eixos locais do elemento girado, borda oposta fixa, limites sem deslocar a ancoragem e Shift opcional. Imagem e texto usam ElementArtwork compartilhado no editor e na prévia. Texto mede limites tipográficos no navegador; imagem preenche o quadro sem contain, permitindo a deformação solicitada. Margens transparentes embutidas no arquivo não são removidas automaticamente. A caneca agora usa 96 faixas, compressão lateral mais pronunciada, curvatura vertical sutil e sombra lateral mascarada.

Testes de geometria passaram em 400 combinações de alças, ângulos e tipos, incluindo ancoragem, limites e round-trip JSON em memória. TypeScript direcionado, CSS e renderização estática de imagem/texto passaram. Isso não substitui o teste de salvar/reabrir no banco: não houve navegador disponível nem escrita remota nesta correção.
