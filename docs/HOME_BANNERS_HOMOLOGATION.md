# Home administrável — implementação local, sem publicação

## Acesso

No painel /admin, abrir **Home / Banners**. Disponível apenas para perfis com permissão settings (ADMIN/DEVELOPER). A API repete a autorização em cada leitura/escrita; POST exige mesma origem. Upload reutiliza CategoryImageField e /api/uploads com finalidade catalog, incluindo validação de formato/assinatura/quota e autorização existentes. Na homologação, usar exclusivamente scripts/dev-homologation.cjs e .env.homologacao com prefixo R2_TEST_PREFIX isolado. Não iniciar o ambiente local com a conexão de produção.

## Funcionalidades

Até 10 banners cadastrados, ativos ou inativos; limite aplicado na interface, servidor e banco. Listagem compacta com miniatura, nome, status, ordem e destino; editar, ativar/desativar, excluir e ordenar por arraste ou setas acessíveis. Botão Salvar banners persiste toda a configuração atomicamente; alterações não salvas têm aviso ao sair. Erros preservam dados digitados.

Campos: nome interno, imagem (arquivo/dropzone/URL HTTPS), duas linhas de título, descrição, cores opcionais, texto do único botão, destino e mensagem WhatsApp. Padrões visuais herdados do Hero. Prévia aproximada responsiva. WhatsApp usa o número comercial já configurado; mensagem por campanha e nova aba segura. Produto/categoria devem existir e estar ativos ao salvar. Páginas internas vêm de lista permitida; externos só HTTPS público, sem credenciais. Não são feitas requisições do servidor a URLs externas.

Home lê configuração em cada renderização e passa apenas banners ativos ao cliente. Mantém 6 segundos, pausa/interação/visibilidade, teclado e reduced-motion. Um banner não mostra controles; zero banners não gera hero vazio. Imagens permanecem proporcionais em card fixo, com contain e fundo existente. Os cinco textos/imagens atuais são configuração inicial; uniformes passa a WhatsApp e os demais a /catalogo até o administrador escolher produto/categoria publicados, evitando presumir categorias cadastradas.

## Persistência e migration pendente

Não existia estrutura de conteúdo/banner reutilizável. StoreSettings tem somente campos comerciais, sem JSON de conteúdo; não foi sobrecarregada com dados alheios. Preparada HomeContent, singleton home, banners JSONB estruturado e validado, revision e updatedAt. Salvamento serializável com revisão otimista; concorrência é recusada para evitar perda de dados. AuditLog registra ação, quantidade e revisão sem conteúdo privado.

Migration preparada exclusivamente em prisma/homologation-migrations/202610160001_home_banners/migration.sql. Cria uma tabela com constraints de singleton, revisão positiva e até 10 itens; nenhuma exclusão nem alteração de tabelas existentes. **Não foi aplicada** e não entrou na cadeia oficial de produção. Schema Prisma inclui o modelo proposto; a integração usa SQL parametrizado para não exigir regenerar Client do servidor existente antes da autorização.

Enquanto a tabela não existe, Home mantém os cinco padrões. Painel identifica provisioningRequired, permite preparar a prévia e bloqueia salvar/uploads. Isso evita aparentar persistência inexistente. Não há seed nem escrita automática ao visitar Home/painel. A primeira gravação autorizada pelo administrador persiste os padrões editados; até isso eles continuam sendo a configuração inicial do código.

Próxima etapa: autorizar aplicação desta migration SOMENTE na homologação, com confirmação de destino e ponto de recuperação. Não usar os executores antigos de category_seo ou de ativação inicial: são restritos a suas próprias cadeias. Depois validar navegador com sessão ADMIN e R2 de homologação. Integração/aplicação em produção é etapa posterior separada.

## Imagem institucional atualizada

Após confirmação explícita do arquivo português pelo responsável, a seção "Vista a identidade da sua empresa" passou a usar /hero-banner-uniformes.png com next/image, fill e sizes responsivos. Dimensões do card e cantos preservados; object-fit contain e espaço inferior para a legenda mantêm o conteúdo inteiro, sem recortar rostos. Arquivo original não modificado. Enquadramento visual desktop/mobile ainda não homologado no navegador.

## Validação executada e limites

TypeScript direcionado: zero diagnósticos. CSS parseado com PostCSS. scripts/check-home-banners.cjs: cinco padrões, limite 10/11, cores/URLs inválidas, WhatsApp, ativação, validação de produto/categoria/imagem pública, salvar/reabrir em banco simulado, reordenação, conflito de revisão, permissões/mesma origem e bloqueio da migration pendente. Esses testes foram offline, sem carregar .env ou enviar objetos R2.

Separadamente, tentativa de consulta somente leitura à homologação (.env.homologacao e hostname isolado aprovado) para verificar existência de HomeContent falhou com Prisma P1001. Não houve tentativa de contornar o erro, troca de credenciais, acesso à produção ou escrita. Disponibilidade do banco de homologação precisa ser restabelecida antes da validação real.

Investigação posterior direcionada: dev-homologation.cjs --check confirmou carregamento exclusivo de .env.homologacao; endpoint coincide com homologação aprovada e diverge de produção. DNS e TCP 5432 passaram para pooled e direct dessa homologação. Prisma retornou P1000; psql com verify-full/CA/channel binding confirmou password authentication failed, sem erro de certificado, timeout ou endpoint indisponível. Assim, a falha atual é rejeição da autenticação configurada, não indisponibilidade de DNS/porta. Causa histórica exata do P1001 anterior não comprovada. Responsável precisa conferir a conexão/credencial do role na branch homologation e atualizar privadamente somente .env.homologacao se necessário. Nenhum arquivo de ambiente foi alterado. Migration HomeContent não executada; testes reais permanecem bloqueados.

**Não validados no navegador:** upload real, aparência desktop/mobile, arraste, WhatsApp externo, persistência real após salvar/reabrir. Esses testes ficam bloqueados até provisionar HomeContent na homologação; não são declarados homologados. Não houve build completo, migration, commit, push, deploy ou alterações em produção. Personalizador, carrinho, clientes e pedidos não foram reformulados.

## Proteção de indisponibilidade

homeBanners() agora captura falhas de consulta e devolve os cinco padrões em modo readOnly. Diferencia HomeContent ausente (to_regclass nulo/P2021/P2010 com 42P01) de persistência indisponível; registra HOME_BANNERS_FALLBACK com operação e código saneado, sem mensagem bruta, URL ou credencial. Configuração persistida não é apagada nem substituída; volta a ser utilizada quando a leitura funciona.

API bloqueia POST antes do salvamento quando readOnly; painel bloqueia Salvar e upload e mostra persistenceMessage. Falha durante salvamento mantém os campos digitados e bloqueia novas tentativas até recarregar. Autenticação não é contornada: se a conexão impede validar sessão/permissão, a API retorna 503 explícito, sem liberar dados administrativos. GET não consulta destinos adicionais quando a persistência já está indisponível.

Testes offline adicionais passaram: P1000/P1001/P1011, tabela ausente, fallback com cinco banners, GET somente leitura, POST bloqueado e retomada dos dez banners previamente persistidos no banco simulado. TypeScript direcionado: zero diagnósticos. Consulta real somente leitura exclusivamente na homologação retornou P1001 nesta última tentativa (servidor inacessível pelo cliente); não foi possível verificar a tabela. Isso não prova desaparecimento da falha anterior P1000 nem mudança de senha: autenticação só poderá ser reavaliada quando a conexão alcançar o banco. Nenhuma variável foi alterada ou conexão trocada por produção.
