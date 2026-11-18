### 🧪 Testes

```bash
pnpm test
```

Usa [Vitest](https://vitest.dev). Os testes cobrem a calculadora de cardio, as estatísticas e recordes de carga, a normalização e o schema dos dados salvos, o backup, as chaves de armazenamento e os formatadores de data e duração.

Para reexecutar ao salvar: `pnpm test:watch`.

Os testes de ponta a ponta (Playwright, em `e2e/`) abrem o app no Chromium e percorrem os fluxos inteiros: montar um treino, registrar uma série e finalizar, recarregar no meio do treino, exportar, apagar e importar o backup, e abrir todas as telas sem erros.

```bash
pnpm exec playwright install chromium   # só na primeira vez
pnpm test:e2e                           # gera o build e testa contra ele
```
