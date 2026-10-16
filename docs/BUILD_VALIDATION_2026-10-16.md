# Validação isolada de build — 16/10/2026

Branch develop/ma-commerce, base 355a9c1f2026971ff2caa84b64e63c7340adf0e5, incluindo as alterações locais de preparação ainda sem commit. Não representa apenas os arquivos do commit base.

## Resultado real

- Build Next.js 16.3.2/Turbopack completo: exit code 0.
- Compilação concluída em 19,2 s; TypeScript concluído em 7,2 s; geração de 24/24 páginas e otimização concluídas.
- Prisma Client 6.19.0 gerado de verdade na cópia descartável, carregando prisma.config.ts e o schema atuais.
- Node.js 22.23.3 portátil oficial, arquivo verificado por SHA-256 contra SHASUMS256.txt da distribuição oficial.
- Testes offline de configuração hospedada e guardas de migration também executados com Node 22. Não executam banco, build ou migration reais.

## Isolamento e limitações

Docker/Podman não estão disponíveis; WSL existe como executável, mas não há instalação Linux. Foi utilizado **Windows x64**, não Linux. Não foi instalado WSL nem alterado o runtime global.

Fonte e dependências foram copiadas para um diretório descartável ignorado em .npm-cache/build-validation-*. Nenhum arquivo .env real, .env.local ou .env.homologacao foi copiado. A cópia recebeu somente configuração fictícia com senha aleatória e URL local; o preload removeu configurações herdadas e bloqueou consultas Prisma antes de abrir conexão. PostgreSQL e endpoints Neon/R2 também foram bloqueados nas interfaces de rede Node. Geração usa engines Windows já instalados; não houve geração do Client Linux nem acesso de escrita a serviços.

O build utilizou scripts/run-next.cjs no caminho local protegido; o caminho hospedado Linux foi coberto por fixtures offline, não executado em Linux. Logo, o resultado comprova compilação/TypeScript/prerender no Windows com Node 22 e geração do Client Windows, **não** execução completa da configuração Hostinger ou engines Linux.

Apenas na cópia, turbopack.root foi fixado no diretório descartável para evitar que a detecção de múltiplos lockfiles selecionasse o projeto pai. Essa alteração não foi feita no next.config.ts do projeto. O projeto e o servidor de homologação não foram reiniciados nem tiveram seu Client regenerado. Foi interrompido somente o primeiro build usando o Node portátil para corrigir a raiz do snapshot.

## Aviso observado

Leitura dinâmica em scripts/project-env.cjs faz o tracing incluir arquivos amplamente. A conferência de 29 manifestos NFT não encontrou .env nos itens suspeitos, mas encontrou o preload temporário da validação em 21 entradas. É aviso de empacotamento, não erro de compilação; nenhuma correção funcional foi feita, conforme escopo de corrigir somente bloqueios comprovados.

**Não publicar este artefato descartável**, que contém bloqueios e fixtures de validação. Gerar o artefato definitivo em Linux/Hostinger após autorização e conferir tamanho/tracing. As páginas geradas sem dados não são evidência de funcionamento do catálogo, autenticação, compra, upload ou persistência.

## Bloqueios restantes para liberação

1. Executar validação Linux/Node 22 com geração dos engines corretos e variáveis hospedadas, em ambiente isolado sem permissões de escrita na produção.
2. Resolver a migration SEO de categorias em produção após backup/ensaio de restauração e autorização específica. Nesta validação não houve consultas nem alterações no banco.
3. Conferir comandos de build/start, variáveis e CA no hPanel e validar os fluxos reais, incluindo testes visuais do personalizador pendentes.
4. Revisar/registrar o commit candidato final e obter autorização para merge/push/deploy. Main possui auto-deploy; nada foi enviado.

Na validação inicial acima, nenhuma alteração funcional no código-fonte foi necessária. Não houve migrations, alteração de banco/R2, merge, commit, push ou deploy. Configuração e arquivos de homologação foram preservados.

## Correção direcionada do build Hostinger — Webpack

Após relato de TurbopackInternalError em evaluate_webpack_loader/PostCSS na Hostinger, o wrapper passou a adicionar --webpack somente no build hospedado (MA_HOSTED_PRODUCTION=1). Prisma generate permanece obrigatório antes da compilação; flags conflitantes --turbo/--turbopack são bloqueadas. Desenvolvimento e homologação não foram alterados. PostCSS usa @tailwindcss/postcss e globals.css importa tailwindcss conforme Tailwind 4; não foi encontrada necessidade de alterar CSS ou versões.

Hipótese mais provável: falha do processo auxiliar do Turbopack no ambiente hospedado. A causa de infraestrutura exata não foi reproduzida nem comprovada localmente.

Verificações: node --check do wrapper e fixtures offline de ambiente/build passaram, incluindo seleção Webpack, geração prévia, interrupção se Prisma falhar e rejeição de bundler conflitante. Build completo com --webpack na mesma cópia isolada descrita acima: Node 22.23.3/Windows, Next 16.3.2, compilação, TypeScript e 24 páginas concluídos; código de saída 0. Credenciais fictícias e acesso a dados bloqueado; sem escrita Neon/R2. Ainda é necessário validar o build Linux na Hostinger usando npm run build, sem chamar next build diretamente (isso ignora o wrapper). Não publicar o artefato de teste.
