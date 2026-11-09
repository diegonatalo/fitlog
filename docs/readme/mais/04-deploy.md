### 🌐 Deploy

Publicado na [Vercel](https://vercel.com) em [dn-fitlog.vercel.app](https://dn-fitlog.vercel.app).

- A Vercel detecta o Next.js, então não há configuração extra. O acesso direto a páginas como `/biblioteca` funciona, e um endereço desconhecido volta para o início.
- O `robots.txt` e o `sitemap.xml` vêm de `app/robots.ts` e `app/sitemap.ts`. As rotas públicas listadas no sitemap são `/`, `/biblioteca`, `/historico` e `/cardio`; sessões ativas (`/sessao/`) ficam bloqueadas no robots.
- Ao trocar de domínio, defina `NEXT_PUBLIC_SITE_URL` (ou altere o valor padrão em `lib/site.ts`). Sem isso, o Open Graph, o `canonical` e o sitemap continuam apontando para o endereço antigo.
