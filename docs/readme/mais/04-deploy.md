### 🌐 Deploy

Publicado na [Vercel](https://vercel.com) em [dn-fitlog.vercel.app](https://dn-fitlog.vercel.app), com o banco no Neon (integração de Storage da Vercel).

- O script `vercel-build` aplica as migrações pendentes (`drizzle-kit migrate`, pela `DATABASE_URL_UNPOOLED`) e depois gera o build. Só a `main` é publicada (`vercel.json`), então só ela migra o banco de produção.
- Em produção, defina só `BETTER_AUTH_SECRET` (um segredo próprio, diferente do de desenvolvimento). Na Vercel, o endereço do login é o mesmo `SITE_URL` do SEO, e a `DATABASE_URL` vem da integração com o Neon.
- O `robots.txt` e o `sitemap.xml` vêm de `app/robots.ts` e `app/sitemap.ts`. A landing fica em `/` e o app em `/app`, que pede login (os endereços antigos sem `/app` redirecionam com 308, em `lib/redirects.ts`). O sitemap lista só as páginas públicas: a landing, `/privacidade` e `/termos`.
- Ao trocar de domínio, defina `NEXT_PUBLIC_SITE_URL` (ou altere o valor padrão em `lib/site.ts`).
