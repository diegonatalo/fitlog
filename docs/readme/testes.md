### 🧪 Testes

```bash
pnpm test
```

Usa [Vitest](https://vitest.dev). Os testes cobrem a calculadora de cardio, as estatísticas e recordes de carga, a normalização e o schema dos dados, o store (com a persistência simulada), a conversão entre linhas do banco e registros do app, a validação dos formulários de login e os formatadores de data e duração.

Para reexecutar ao salvar: `pnpm test:watch`.

Os testes de ponta a ponta (Playwright, em `e2e/`) abrem o app no Chromium com um banco de verdade. Cada teste cria a própria conta e percorre os fluxos inteiros: criar conta, sair e entrar de novo com os dados no lugar, senha errada, e-mail repetido, uma conta não ver os dados de outra, excluir a conta, montar um treino e registrar uma série, recarregar no meio do treino, apagar todos os dados, e abrir todas as telas sem erros.

```bash
pnpm exec playwright install chromium   # só na primeira vez
pnpm test:e2e                           # gera o build e testa contra o banco do .env.local
```

No CI, o E2E roda contra um Postgres descartável do próprio GitHub Actions, nunca contra o Neon.
