### 🌐 Deploy

Publicado na [Vercel](https://vercel.com) em [dn-fitlog.vercel.app](https://dn-fitlog.vercel.app).

- O `vercel.json` reescreve todas as rotas para `index.html`, o que mantém funcionando o acesso direto a páginas como `/biblioteca`.
- O `robots.txt` e o `sitemap.xml` são gerados na build, em `vite.config.ts`. As rotas públicas listadas no sitemap são `/`, `/biblioteca`, `/historico` e `/cardio`; sessões ativas (`/sessao/`) ficam bloqueadas no robots.
- Ao trocar de domínio, defina `VITE_SITE_URL` (ou altere o valor padrão em `vite.config.ts`). Sem isso, o Open Graph, o `canonical` e o sitemap continuam apontando para o endereço antigo.
