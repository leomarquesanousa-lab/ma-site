# Galeria de artes R2

## Estado local

Importação em `ma_commerce_local`: 471 imagens em nove pastas, todas inicialmente inativas. Nenhuma alteração de objetos no bucket e nenhuma migration. Pastas reais:

- `artes/Bula Vivertida/`
- `artes/Divertidamente/`
- `artes/Flork/`
- `artes/Labubu/`
- `artes/Lilo Stitch/`
- `artes/Lilo Stitch/Artes/`
- `artes/Lilo Stitch/Artes/Mockups/`
- `artes/Pai/`
- `artes/Times/`

Contagens de categorias agregam suas subpastas. Há cinco originais acima de 5 MB (máximo encontrado: 14.398.523 bytes). Todos são reconhecidos no administrador. A galeria do cliente respeita o limite do mockup selecionado; não amplia o limite de upload ou salvamento.

## Configuração no painel

Abra `/admin` → **Biblioteca de artes e modelos licenciados** → **Galeria R2 · categorias, direitos e sincronização**. Essa seção já é exibida para quem tem permissão de produtos.

1. **Sincronizar artes** importa referências e detecta adições, mudanças e remoções. Novas imagens permanecem inativas. Remoções desativam o cadastro, sem excluir registros nem arquivos. Repetir a sincronização não duplica imagens.
2. Em **Configurar categorias e produtos**, escolha um ou vários produtos por pasta, informe origem/autoria, licença e confirme autorização comercial. Marque a categoria ativa e salve sua configuração.
3. Pastas mais específicas têm prioridade, inclusive quando inativas. A configuração de categorias aplica-se às suas imagens e pede confirmação antes de substituir edições individuais anteriores.
4. A lista de imagens tem busca, paginação de 24 itens e edição individual. Na imagem, configure compatibilidade, origem, licença, confirmação comercial e status. A categoria explicitamente desativada bloqueia a ativação individual. A sincronização preserva essas edições.

Sem licença e confirmação comercial, a publicação é rejeitada no servidor. Miniaturas inativas exigem acesso administrativo; projetos já salvos podem recuperar sua própria prévia. Originais nunca são públicos.

## Ambiente e armazenamento

O banco e os uploads locais continuam carregados exclusivamente por `.env.desenvolvimento` via `npm run dev:homologacao`. Não se acessa Neon.

O leitor R2 permite somente GET/List sob `artes/`, usando o assinador do adaptador existente. No desenvolvimento, lê **somente os quatro campos R2** de `.env.artes-r2`, se esse arquivo existir, ou de `.env` como origem já configurada. Não injeta essas variáveis em `process.env`, não carrega `DATABASE_URL` e não muda `ASSET_STORAGE=local`. Os arquivos de ambiente não foram alterados. Em hospedagem utiliza os campos R2 fornecidos ao processo.

Para menor privilégio, crie manualmente `.env.artes-r2` (ignorado pelo Git) com `R2_ACCOUNT_ID`, `R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, usando credencial limitada a leitura do bucket. A leitura com a credencial existente funcionou; não foi verificado se essa credencial também possui permissões de escrita. O código da biblioteca não oferece operações de escrita no R2.

Reutiliza `Artwork`, `StoredAsset` e `AuditLog`. Categorias não viram tabelas. As referências mantêm chave e ETag do original; mudanças remotas invalidam o original antigo, em vez de trocar silenciosamente o arquivo de um pedido. Arquivos externos substituídos ou removidos exigem revisão de produção. A miniatura WebP é gerada sob demanda e guardada em `.ma-storage/library-previews/`; não substitui o original. Essa pasta precisa ser gravável no servidor. O cache pode ser regenerado.

Referências R2 importadas não consomem a cota dos uploads locais. A sincronização usa transação e bloqueio para trocar o catálogo somente depois de completar a listagem paginada; erros preservam o catálogo anterior. Há limites de segurança de 100 mil objetos, 20 MB por original e 40 megapixels na decodificação.

## Personalizador

A galeria consulta o catálogo do banco (24 itens por página), filtrando pelo `productType` configurado no mockup, tema, subtema, nome e tamanho máximo do arquivo. Não lista o bucket a cada acesso. Permite configurar MUG, SHIRT, PILLOW e TILE; isso não cria editores de almofadas ou azulejos, nem amplia o fluxo comercial existente.

Canecas usam SAFE_CONTAIN por padrão para artes da biblioteca. O cliente ainda pode escolher FULL_WRAP_COVER ou CENTERED no controle existente. A composição, as camadas, a textura dinâmica 3D, o desfazer/refazer e o carrinho são os existentes. Salvar preserva `artworkId`, `sourceAssetId`, revisão e referência ao original; os pixels reais são lidos para calcular DPI. O 3D continua restrito ao ambiente já autorizado.

## Verificações

Executados: TypeScript, `node scripts/check-r2-library.cjs`, listagem real, importação local, segunda sincronização sem duplicações nem mudanças nos registros, paginação administrativa, miniatura real, bloqueio anônimo de original/miniatura inativa e rejeição de publicação sem direitos. Resultados operacionais privados em `.ma-r2-inventory/`, ignorada pelo Git.

**Pendentes:** configurar produtos/direitos e ativar artes pelo responsável; validação visual no navegador da seleção/troca na caneca 3D, rotação, salvar/reabrir e continuidade ao carrinho. Nenhuma arte foi ativada para simular essa validação. Não houve build completo, migration, commit, push ou deploy.
