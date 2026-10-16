# Caneca 3D — Fase 1, prova de conceito

## Abrir na homologação

1. Iniciar exclusivamente com `node scripts/dev-homologation.cjs` (porta 3002).
2. Entrar pelo login normal com conta autorizada a administrar produtos.
3. Acessar `http://localhost:3002/admin/demo-caneca-3d` e clicar **Abrir demonstração 3D**.

A rota responde 404 fora de `MA_HOMOLOGATION=1` + `MA_RUNTIME=homologation`, antes de importar a autenticação. Não lê produtos, variantes ou arquivos privados. Usa a permissão existente de produtos. Não há gravação no banco, uploads ou mudanças no editor atual.

## Implementação

Three.js 0.186.1 + @types/three 0.186.0; instalados após consulta ao registro npm, com scripts de instalação desabilitados. Sem React Three Fiber/Drei: cena imperativa isolada, sem dependência de uma versão específica do renderer React. Projeto usa React 19.2.8 e Next 16.3.2. Compatibilidade de tipos verificada; execução gráfica ainda exige homologação visual.

Modelo procedural próprio, criado para esta demonstração: superfície de revolução com fundo, paredes, borda e interior; alça tubular curva. A arte própria de teste é desenhada em atlas CanvasTexture 2048×850 e mapeada por UV somente no exterior. A alça e o interior usam material cerâmico separado. A textura é demonstrativa e não substitui arquivos de impressão.

Iluminação de estúdio com ambiente procedural, luzes direcionais, cerâmica com clearcoat, tone mapping e sombra no plano de apoio. O modelo não representa necessariamente qualquer SKU real e não é associado automaticamente ao catálogo.

Controles: arraste com mouse/dedo; roda ou pinça para zoom. Órbita horizontal 360°; inclinação vertical e distância limitadas. Botões para girar 90°, zoom e vista inicial. Teclado: esquerda/direita, +/− e Home. Cores são exemplos, não variantes reais.

## Desempenho e fallback

- Biblioteca/cena carregadas somente ao abrir a demonstração; sem importação nas páginas atuais da loja.
- Renderização sob demanda, com frames adicionais somente durante amortecimento de interação. Sem rotação automática.
- DPR limitado a 1,75, anisotropia até 4, sombra 1024²; pausa com aba oculta.
- Movimento reduzido desativa amortecimento. Recursos, controles, listeners, textura, geometrias, materiais e contexto gráfico liberados ao desmontar.
- Sem WebGL 2 ou com perda de contexto, mostra estado indisponível e ilustração 2D explicitamente identificada, exclusiva desta demonstração.
- Sem carregamento de GLB/GLTF arbitrário nem dependências de serviços/CDNs/modelos comerciais.

## Validação pendente antes de aprovar

Conferir geometria, alça, interior, legibilidade, costura UV, qualidade do material, sombras e zoom no desktop e mobile; girar uma volta completa, trocar cores, testar teclado e fallback WebGL. Medir FPS/memória no dispositivo de destino. Testes de geometria e tipos não equivalem a validação visual. Nenhum navegador conectado estava disponível durante a implementação.

## Fases posteriores — não implementadas

Integração da composição 2D como textura, associação explícita produto/variante/modelo, mapeamento físico de áreas e vistas, cores reais de variantes e importação validada de modelos. Validar acesso autenticado às texturas privadas sem publicar originais. Só depois homologar salvamento/carrinho e planejar camisetas. Nenhuma estrutura Prisma ou migration é necessária para esta Fase 1.
