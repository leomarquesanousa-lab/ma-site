# Full wrap de canecas — checkpoint de homologação

## Comportamento

Na página de uma caneca personalizável, na homologação, **FULL_WRAP** é a aplicação inicial padrão de artes prontas e uploads de fotografias. O quadro ocupa 98% da largura e altura da área ativa: margem de 1% por lado. O original não é alterado; um recorte normalizado tipo cover é registrado na composição JSON, validado no servidor e reutilizado no editor, prévia 2D, textura 3D e manifesto de produção.

A proporção do recorte usa as medidas em mm da área quando disponíveis. Sem medidas reais, usa a proporção ilustrativa da faixa UV do modelo experimental; permanece necessária a configuração das medidas antes da produção. Nenhum campo Prisma ou migration foi criado.

No atlas 3D, os limites configurados ocupam uma faixa de 92% da circunferência e 85% da altura do atlas; essa faixa está contida na parede externa imprimível, excluindo borda e base. A costura UV foi deslocada para a alça. Com o quadro de 98%, a impressão inicial cobre aproximadamente 90,16% da circunferência (324,6°), preservando uma pequena faixa não impressa próxima da alça. São parâmetros da geometria experimental, sem garantia de equivalência a um SKU físico.

## Ajustes e continuidade

- **Aplicação inicial** permite escolher Full wrap ou Central para novas imagens.
- **Modo da imagem** permite converter a imagem selecionada, inclusive uma composição antiga, sem excluir a fonte.
- Em FULL_WRAP, arraste ou setas reposicionam o recorte; Alt + arraste/setas move o quadro. Também há controles de recorte horizontal/vertical. Quando não há excesso em um eixo, não há deslocamento nesse eixo.
- Alças, rotação, camadas, textos e histórico continuam disponíveis.
- Central/CENTERED usa até 32% da largura útil, para logo localizado, respeitando a proporção física de referência.
- Trocar a arte pronta mantém textos/uploads manuais e outras áreas/vistas; a regra existente de substituição permanece.
- Projetos antigos não são atualizados em lote. Escolher FULL_WRAP na imagem ou clicar novamente numa arte antiga aplica o novo padrão. Salvamento existente passa a guardar modo e recorte; não foi realizada gravação de teste nesta tarefa.
- DPI considera somente os pixels restantes após o crop. O manifesto v3 inclui modo e recorte, com exportação industrial e conferência de arte ainda pendentes.

## Verificações realizadas

TypeScript direcionado sem erros. Testes em memória: seis proporções, ocupação de 98%, crop cover com medidas físicas, 36 combinações de rotação/reposicionamento, limites do recorte, round-trip JSON pelo validador real, compatibilidade legada, recortes inválidos, modo Central, DPI após crop e mapeamento de 92%/85% para o atlas. Nenhum arquivo original foi regravado; nenhum upload, migration, registro de banco ou dado de produção foi alterado.

## Validação pendente

Iniciar com `node scripts/dev-homologation.cjs`; entrar normalmente; abrir uma caneca com área válida; selecionar arte decorativa e foto; girar 360°; conferir continuidade, área junto à alça, altura, crop e reposicionamento; trocar arte; adicionar texto; testar Central; salvar/reabrir com dados fictícios na homologação. Sem navegador conectado, estes testes visuais e de persistência real não estão concluídos.

O mapeamento continua usando a vista ativa no modelo experimental. Calibração física por produto, união de várias vistas e preset administrativo de aplicação ainda são evoluções futuras. As medidas de área existentes foram reutilizadas; nenhuma configuração comercial foi inventada.
