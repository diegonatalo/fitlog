### 🌐 Deploy

Publicado na [Vercel](https://vercel.com) em [dn-fitlog.vercel.app](https://dn-fitlog.vercel.app).

- A Vercel detecta o Next.js, então não há configuração extra. O acesso direto a páginas como `/biblioteca` funciona, e um endereço desconhecido volta para o início.
- O `robots.txt` e o `sitemap.xml` vêm de `app/robots.ts` e `app/sitemap.ts`. A landing fica em `/` e o app em `/app` (os endereços antigos sem `/app` redirecionam com 308, em `lib/redirects.ts`). O sitemap lista a landing, as telas fixas do app, `/privacidade` e `/termos`. O app instala como PWA com `start_url` em `/app`.
- Ao trocar de domínio, defina `NEXT_PUBLIC_SITE_URL` (ou altere o valor padrão em `lib/site.ts`). Sem isso, o Open Graph, o `canonical` e o sitemap continuam apontando para o endereço antigo.
