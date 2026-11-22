### 🔒 Seus dados

Os dados ficam num banco Postgres ([Neon](https://neon.tech)), ligados à sua conta, e aparecem em qualquer aparelho em que você entrar. O login é por e-mail e senha, com [Better Auth](https://www.better-auth.com).

- Toda tabela do app tem chave `(user_id, id)` e cada Server Action confere a sessão antes de ler ou gravar: uma conta nunca alcança as linhas de outra.
- A tela atualiza na hora e a mudança é salva em segundo plano. Se um salvamento falhar, aparece um aviso para recarregar. Fechar a aba no meio de um salvamento pede confirmação.
- O que chega ao servidor é validado antes de ser gravado: dados inválidos são recusados, e nomes, anotações e listas têm tamanho máximo (`LIMITS` em `lib/schema.ts`).
- Login e cadastro têm limite de tentativas por IP, contado no banco para valer em todas as instâncias da Vercel. Todas as páginas saem com cabeçalhos de segurança (`lib/security-headers.ts`), entre eles o que impede abrir o site dentro de um iframe de outro site.
- No navegador ficam só o cookie de sessão e a escolha de tema. O service worker guarda em cache só arquivos estáticos e as páginas públicas, nunca as telas do app.

> [!NOTE]
> Em **Ajustes**, **Apagar todos os dados** limpa a conta, e **Excluir conta** (com a sua senha) apaga a conta e tudo o que está nela.
> Uma cópia dos dados pode ser pedida pelo contato da página de privacidade.
