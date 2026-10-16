# Artes prontas na caneca 3D — homologação

## Utilização

Iniciar com `node scripts/dev-homologation.cjs`, entrar pelo login normal e abrir a página de uma caneca personalizável, com variante, mockup e área válidos. Em **Artes prontas**, escolher um tema e clicar na miniatura. Na homologação, isso abre automaticamente **Ver caneca 3D**. **Editar arte 2D** retorna às alças sem perder a composição. Texto, upload, camadas, desfazer/refazer e salvar/reabrir usam o fluxo existente.

A página isolada `/admin/demo-caneca-3d` continua sendo a demonstração original com arte fictícia. A biblioteca integrada pertence ao projeto na página do produto, que possui produto/variante/áreas e salvamento reais.

## Regra de aplicação

- A imagem entra centralizada na área ativa, com proporção preservada e até 88% da largura/altura, equivalente a pelo menos 6% de margem por lado.
- Presets textuais existentes da biblioteca continuam usando o posicionamento canônico e os bloqueios já validados no servidor.
- Outra arte substitui as camadas vinculadas à biblioteca somente na mesma área/vista. Textos e uploads manuais, outras áreas e outras vistas permanecem.
- A arte principal e seus presets entram abaixo das camadas manuais para não encobrir textos já adicionados. A seleção fica destacada e indica “Aplicada”. Repetir o clique não duplica a arte.
- A troca inteira corresponde a uma etapa do histórico; uma falha ao carregar a nova imagem mantém a composição anterior.
- Não foram criados presets geométricos administrativos, tabelas ou migrations. Escala/posição avançadas por arte e compatibilidade específica de vistas continuam como evolução futura.

## Textura e segurança

O visualizador recebe a composição da vista ativa, usa o atlas temporário existente e atualiza `CanvasTexture.needsUpdate`, preservando cena e câmera durante edições. Imagens são carregadas apenas de `/api/arquivos/:id`, com a sessão normal, sem redirects, sem URLs arbitrárias e sem publicação de arquivos privados. Cache de bitmaps limitado às imagens da composição ativa; recursos são liberados ao fechar o visualizador.

Imagem, texto, rotação, ordem e recorte são desenhados em canvas intermediário, depois aplicados à superfície UV. Resultados obsoletos são descartados e falhas deixam aviso explícito. A textura é somente de visualização: miniaturas da biblioteca continuam miniaturas; o original permanece ligado pelo servidor ao projeto e à preparação de produção. O cálculo de DPI agora usa o eixo mais esticado para evitar superestimar qualidade com free transform.

## Limitações

3D habilitado somente pelo servidor de homologação, apenas para templates MUG válidos. É o modelo procedural experimental aprovado para a prova de conceito, sem associação permanente a SKUs. A normalização das áreas para o atlas é ilustrativa; faltam calibração física e UV por produto/modelo. Exibe a vista ativa, sem reunir automaticamente várias vistas em um único mapeamento global. Cores do visualizador ainda são demonstrativas. Nenhuma arte ou variante real foi inventada ou cadastrada para os testes.

## Verificações

Passaram: TypeScript direcionado; posicionamento em proporções retrato/quadrada/paisagem; margens; substituição isolada; preservação de camadas manuais e outras vistas; centralização no atlas; desenho imagem/texto; clipping; cancelamento de resultados obsoletos; falha de imagem; DPI reduzido após alongamento. Testes em memória, sem uploads ou gravação remota. A configuração de homologação passou em `--check`.

Sem navegador conectado: aplicação visual, giro real, troca de arte, texto adicional e salvar/reabrir no banco continuam pendentes de teste autenticado na homologação. Round-trip em memória não equivale a persistência real.

Para camisetas, a biblioteca/composição/layout já são reutilizáveis; faltam modelo licenciado/próprio, seleção explícita por produto, materiais, UVs frente/costas e validação visual/produção.
