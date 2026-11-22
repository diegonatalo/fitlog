Requer [Node.js](https://nodejs.org), [pnpm](https://pnpm.io) e um banco Postgres (uma branch `dev` no [Neon](https://neon.tech) serve).

```bash
git clone https://github.com/diegonatalo/fitlog.git
cd fitlog
pnpm install
cp .env.example .env.local   # preencha DATABASE_URL e BETTER_AUTH_SECRET
pnpm db:migrate              # cria as tabelas no banco do .env.local
pnpm dev                     # http://localhost:3000
```

Para testar no celular, abra o endereço de rede que o `pnpm dev` mostra (o IP da sua máquina) na mesma rede Wi-Fi.

| Comando | O que faz |
|---|---|
| `pnpm dev` | Servidor de desenvolvimento |
| `pnpm build` | Checa os tipos e gera o build de produção em `.next/` |
| `pnpm start` | Serve o build de produção (o service worker só roda nele) |
| `pnpm lint` | Roda o ESLint |
| `pnpm test:e2e` | Roda os testes de ponta a ponta (Playwright) |
| `pnpm db:generate` | Gera uma migração SQL em `drizzle/` depois de mudar `lib/db/schema.ts` |
| `pnpm db:migrate` | Aplica as migrações pendentes no banco do `.env.local` |

### 🔑 Variáveis de ambiente

Veja [`.env.example`](.env.example).

| Variável | Descrição | Se não definir |
|---|---|---|
| `DATABASE_URL` | URL do Postgres, com pooler. Em desenvolvimento, use uma branch `dev`, nunca a de produção, num banco com nome terminado em `_dev` (senão o `pnpm dev`, o E2E e as migrações param). | O app não abre |
| `DATABASE_URL_UNPOOLED` | URL sem pooler, usada pelas migrações. | As migrações usam a `DATABASE_URL` |
| `BETTER_AUTH_SECRET` | Segredo que assina os cookies de sessão. Gere com `openssl rand -base64 32`, um por ambiente. | Em produção, o login e o app dão erro |
| `BETTER_AUTH_URL` | Endereço do site em desenvolvimento e nos testes, sem barra no final. Na Vercel não precisa: vale o `SITE_URL`. | Better Auth deduz pela requisição e avisa no log |
| `NEXT_PUBLIC_SITE_URL` | URL pública do site, usada no `canonical`, nas tags Open Graph, no `robots.txt` e no `sitemap.xml`. Sem barra no final. | Usa `https://dn-fitlog.vercel.app` |
