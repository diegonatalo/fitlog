Requer [Node.js](https://nodejs.org) e [pnpm](https://pnpm.io).

```bash
git clone https://github.com/diegonatalo/FitLog.git
cd FitLog
pnpm install
pnpm dev        # http://localhost:3000
```

Para testar no celular, abra o endereço de rede que o `pnpm dev` mostra (o IP da sua máquina) na mesma rede Wi-Fi.

| Comando | O que faz |
|---|---|
| `pnpm dev` | Servidor de desenvolvimento |
| `pnpm build` | Checa os tipos e gera o build de produção em `.next/` |
| `pnpm start` | Serve o build de produção (o service worker só roda nele) |
| `pnpm lint` | Roda o ESLint |

### 🔑 Variáveis de ambiente

Veja [`.env.example`](.env.example). O nome antigo, `VITE_SITE_URL`, continua sendo aceito.

| Variável | Descrição | Se não definir |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL pública do site, usada no `canonical`, nas tags Open Graph, no `robots.txt` e no `sitemap.xml`. Sem barra no final. | Usa `https://dn-fitlog.vercel.app` |
