# Mockup escolhido pelo administrador

## Consolidação: mockup individual por produto

O formulário agora mostra “Configure o mockup deste produto” quando não há base/área configurada. É possível salvar DRAFT sem mockup; linhas novas inteiramente vazias de mockup são ignoradas nesse salvamento. Dados parcialmente preenchidos inválidos permanecem no formulário com erro, em vez de descartar silenciosamente configurações.

“Salvar e publicar” verifica TODAS as variantes ativas: cada uma precisa de vista selecionável com imagem-base, áreas válidas e medidas físicas positivas. Falhas fazem rollback da transação. Produtos comuns continuam dispensados de mockup. Nenhum cadastro existente é alterado automaticamente por essa validação.

A mesma seleção por variante/vista usada no cliente agora é aplicada no servidor ao salvar composição/snapshot. Não é permitido salvar usando uma base geral substituída por uma específica daquela vista. O snapshot guarda as vistas efetivas e referências originais; o serviço de pedidos existente conserva esse snapshot no item, e a exportação industrial continua pendente de validação/conferência.

O operador pode selecionar “Reutilizar imagem de outra vista”, ou associar uma vista a várias variantes. Ambas opções reaproveitam a referência persistente e não fazem novo upload. O tipo “Canecas e copos (2D)” reutiliza a classificação MUG existente; não representa renderização de superfícies curvas.

Testes adicionais reais na homologação: hml-mugs-1792122151955 (variantes Amarela/Branca com referências distintas) e hml-shirt-1792122151955 (Frente/Costas). Imagens PNG esquemáticas próprias usadas exclusivamente como fixtures técnicas, NÃO fotografias reais nem substitutas dos produtos existentes. Cadastro/publicação em uma requisição; arte e texto salvos em ambas variantes; composição frente/costas salva e reaberta; snapshots corretos. DRAFT sem mockup aceito; publicação sem mockup recusada com 400 e status DRAFT preservado. Sem navegador: aparência dos overlays, fidelidade fotográfica e toque ainda não validados visualmente.

Arquivos adicionais desta consolidação: lib/commerce/admin.ts; app/api/commerce/[...path]/route.ts; components/commerce/AdminWorkspace.tsx; ProductCompositionFields.tsx; este documento. Mesmas tabelas e infraestrutura; nenhuma migration necessária ou executada. Produção não acessada, nenhum produto antigo alterado.

Nenhum arquivo precisa ser fornecido pelo chat. A interface e o salvamento estão implementados no formulário único de produto.

## Onde clicar

1. Acesse http://localhost:3002/admin e abra **Produtos**.
2. Clique **Novo produto** ou **Editar**. Escolha a modalidade **Personalizável**.
3. Cadastre as variantes, inclusive seus SKUs, na mesma tela.
4. Abra **Mockup de personalização** e clique **Adicionar vista**.
5. Informe o nome (ex.: Frente/Costas) e o tipo Caneca/Camiseta.
6. Na imagem-base, arraste o arquivo, clique **Escolher arquivo** ou **Usar URL externa**. Upload utiliza a API/adaptador R2 existentes com purpose=mockup. As fotos da galeria comercial NÃO são copiadas para este campo.
7. Em **Variantes desta vista**, escolha variantes específicas ou mantenha **Todas as variantes**. É possível vincular variantes novas antes do primeiro salvamento; o servidor resolve seus SKUs para IDs na mesma transação.
8. Clique **Desenhar nova área** e arraste sobre a prévia. Mova o retângulo pelo centro; redimensione pelo canto dourado. Setas do teclado movem; setas no controle de redimensionamento ajustam tamanho. Os campos abaixo continuam disponíveis para ajuste preciso, nome, permissões e medidas reais em mm. Não há JSON.
9. Adicione outras áreas/vistas se necessário. Clique **Salvar rascunho** ou **Salvar e publicar**. A publicação exige configuração válida. Erros preservam os dados digitados e não alteram o cadastro anterior.

## Correspondência e preservação

Imagem-base e galeria comercial são referências distintas. O estúdio carrega somente vistas do produto e variantes permitidas. Um mockup específico prevalece sobre o geral da MESMA vista; outras vistas permanecem independentes. Configurar “Frente” para duas variantes não inativa a vista da outra variante.

Substituição gera uma nova versão do template, preservando a versão antiga, áreas e arquivo original. Remover da interface não exclui fisicamente o R2. Caso altere SKUs depois de selecionar variantes, revise a seleção se houver aviso no salvamento. Uploads externos precisam ser HTTPS públicos e dependem da disponibilidade do fornecedor; o servidor não baixa URLs arbitrárias. A prévia visual também valida a referência antes de carregar a imagem.

O editor visual usa o mesmo quadro quadrado/object-fit contain do estúdio; desenhar uma área não inventa medidas físicas, que precisam ser preenchidas em milímetros. Não há fallback para fotos comerciais ou para o copo térmico. Sem base/área, o cliente vê um estado de configuração pendente. A vista térmica anteriormente inativada na homologação permanece preservada; não foi selecionada imagem substituta definitiva.

## Validação

Fixture DRAFT hml-mockup-ui-1792121915475, exclusivamente na homologação: dois PNGs técnicos gerados para teste enviados pelo upload existente ao prefixo R2 de homologação; imagens comerciais vazias; duas variantes novas vinculadas; três mockups (vista geral, vista específica e segunda vista); prevalência por variante; substituição versionada e referência HTTPS persistida; originais anteriores legíveis. A URL example.com da fixture valida o contrato HTTPS, NÃO a disponibilidade de imagem remota. Essa fixture não foi publicada e não representa o mockup real de uma caneca.

scripts/check-mockup-editor.cjs verifica handlers reais de desenho/movimento/redimensionamento/teclado, limites, estado vazio, URL segura, seleção de vistas/variantes e upload reutilizado. Testes do formulário único e metadata continuam passando; TypeScript direcionado e CSS conferidos. Não houve navegador conectado, portanto revisão visual desktop/mobile permanece pendente.

Produção e arquivos .env preservados. Não houve migrations, bibliotecas novas, build completo, deploy, commit ou push. Alterações direcionadas: CategoryImageField.tsx; ProductCompositionFields.tsx; AdminWorkspace.tsx; ProductPurchase.tsx; novos MockupAreaEditor.tsx/.module.css e lib/commerce/mockups.ts; lib/commerce/admin.ts; testes e este guia.
