# Conexão privada de desenvolvimento

Crie manualmente `.env.local` na raiz, com apenas esta variável:

```dotenv
DATABASE_URL="postgresql://ma_commerce_dev:SENHA_CODIFICADA@127.0.0.1:5432/ma_commerce_local?schema=public"
```

Substitua o marcador pela senha local com codificação percentual de URL (por exemplo, `@` vira `%40`, `#` vira `%23`, `$` vira `%24`). Não use variáveis ou interpolação na URL. Não copie a conexão do `.env` original. Edite o arquivo diretamente no editor, sem colocar a senha em comandos, histórico ou mensagens.

O padrão `.env*` já está ignorado pelo Git. Não force a inclusão desse arquivo e restrinja seu acesso à sua conta Windows. A senha fica em texto no arquivo privado; não compartilhe nem versione esse arquivo.

Inicie com `npm run dev:local` ou `npm run dev`. Ambos leem exclusivamente a conexão de `.env.local`, validam host, porta, banco, usuário e schema, e iniciam em `http://127.0.0.1:3001` sem solicitar senha. Arquivo ausente, incompleto ou destino diferente interrompe a inicialização sem fallback para `.env`.

O Prisma CLI que carrega `prisma.config.ts` utiliza o mesmo leitor e validador. Caso DATABASE_URL já exista no processo, ela deve passar pela mesma validação local; uma URL remota é bloqueada. DIRECT_URL e SHADOW_DATABASE_URL são desativadas. Não utilize configs alternativas para operações de banco. A configuração offline existente serve somente às operações offline documentadas.

Os executores especiais de inicialização e promoção administrativa continuam solicitando senha interativa: são operações privilegiadas ocasionais, separadas da inicialização diária. Esta alteração não executa migrations nem modifica banco, usuários ou permissões.
