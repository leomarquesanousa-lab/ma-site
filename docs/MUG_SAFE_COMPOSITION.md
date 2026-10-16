# Composição segura da caneca — checkpoint

Substitui o padrão automático indiscriminado de full wrap. Não altera projetos antigos em lote: clicar novamente na arte em Automático ou trocar “Modo da imagem” recalcula o enquadramento. Não há migrations, alterações em credenciais ou gravações remotas nesta tarefa.

## Pipeline

1. Decodificar a imagem autorizada, analisar uma amostra 64×64 e combinar nome, tema, tags e presença de presets textuais.
2. Resolver um modo ou respeitar o modo escolhido pelo usuário.
3. Salvar geometria, modo, crop quando aplicável e cor de fundo na composição JSON validada pelo servidor.
4. Gerar uma prancheta intermediária por área. Proporção obtida das medidas em mm existentes; na ausência, usa a referência ilustrativa do modelo. Limite de 2048 px para a prévia.
5. Preencher o fundo, desenhar imagem/texto e camadas na prancheta, respeitando recorte da área.
6. Ajustar a prancheta inteira ao atlas UV sem alterar sua proporção física, depois atualizar a textura existente. Sem regravar originais ou substituir arquivos de produção por textura de preview.

## Modos

- **FULL_WRAP_COVER**: imagem preenche 98% da área, com crop normalizado. Para fotografia identificada ou estampa corrida. O modo legado FULL_WRAP continua aceito para projetos antigos.
- **SAFE_CONTAIN**: imagem inteira, sem crop, centralizada, até 90% da largura e 88% da altura física. Sobras recebem uma cor predominante amostrada das bordas opacas da imagem. A prancheta continua preenchendo a faixa, sem repetir/cortar a frase para ocupar largura.
- **CENTERED**: aplicação localizada, até 32% da largura útil, para logos.

## Escolha automática e limitações

- Metadados de logo → Central.
- Presets de texto ou termos como texto, frase, banner, layout, Feliz Aniversário → Seguro.
- Conteúdo transparente isolado com bounding box pequeno → Central; transparência mais ampla → Seguro.
- Foto/fotografia/estampa corrida/padrão/textura explicitamente identificados → Cover, salvo indícios anteriores de texto/transparência.
- Imagem muito panorâmica/estreita sem indicação explícita de estampa/foto → Seguro.
- Nome típico de câmera IMG/DSC/PHOTO seguido de números → Cover, salvo indícios anteriores.
- Conteúdo desconhecido → Seguro. JPEG isoladamente não prova fotografia.

Não há OCR nem reconhecimento semântico. Texto rasterizado sem metadados pode não ser reconhecido, e presets incorretos podem induzir erro. O padrão conservador e o seletor manual reduzem esse risco; não há promessa de detecção perfeita. O fundo é cor predominante, sem geração por IA ou extensão fotográfica. Bounding box é usado na heurística, não para remover automaticamente partes do original.

A preservação de proporção pode reduzir a cobertura angular quando as medidas cadastradas diferem do modelo experimental; não se força distorção para ocupar toda a circunferência. Ainda faltam calibração física por SKU, mapeamento de múltiplas vistas e validação industrial. O editor mantém ajustes livres posteriores; a garantia de enquadramento seguro refere-se à aplicação inicial sem crop.

## Verificações e pendências

Testes em memória: quatro casos solicitados com metadados/amostras fictícios, contain sem crop e com proporção física preservada, margens, fundo predominante, round-trip pelo validador real, rejeição de crop no modo seguro, tamanho da prancheta, desenho da fonte inteira e proporção de destino UV. TypeScript direcionado e configuração isolada de homologação também verificados.

Sem navegador conectado, não foi validada a aparência das artes reais nem o mockup WebGL. Testar autenticado na homologação: “Feliz Aniversário”, foto romântica, logo e estampa; conferir frente/traseira/alça, texto inteiro e margens; escolher manualmente os modos; salvar e reabrir. Persistência real e teste visual não estão concluídos.
