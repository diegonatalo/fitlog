### 🔒 Seus dados

Os dados ficam num banco Postgres ([Neon](https://neon.tech)), ligados à sua conta, e aparecem em qualquer aparelho em que você entrar. O login é por e-mail e senha, com [Better Auth](https://www.better-auth.com).

- Toda tabela do app tem chave `(user_id, id)` e cada Server Action confere a sessão antes de ler ou gravar: uma conta nunca alcança as linhas de outra.
- A tela atualiza na hora e a mudança é salva em segundo plano. Se um salvamento falhar, aparece um aviso para recarregar. Fechar a aba no meio de um salvamento pede confirmação.
- O que chega ao servidor passa pela mesma validação do backup: dados inválidos são recusados.
- No navegador ficam só o cookie de sessão e a escolha de tema. O service worker guarda em cache só arquivos estáticos e as páginas públicas, nunca as telas do app.

> [!NOTE]
> Em **Ajustes**, **Exportar backup** salva um arquivo JSON (treinos, cardio e perfil) e **Importar backup** o traz para a conta.
> **Apagar todos os dados** limpa a conta, e **Excluir conta** apaga a conta e tudo o que está nela.
