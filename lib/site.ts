/**
 * URL pública do site, sem barra final. Usada nas tags Open Graph, no canonical,
 * no robots.txt e no sitemap.xml. `VITE_SITE_URL` (nome antigo) continua valendo
 * para não quebrar deploys já configurados.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.VITE_SITE_URL ??
  "https://dn-fitlog.vercel.app"
).replace(/\/+$/, "");

/** Páginas públicas, listadas no sitemap. O resto do app são dados de cada pessoa. */
export const PUBLIC_ROUTES = ["/", "/biblioteca", "/historico", "/cardio"];
