/**
 * URL pública do site, sem barra final. Usada nas tags Open Graph, no canonical,
 * no robots.txt e no sitemap.xml. Para publicar em outro domínio, defina
 * NEXT_PUBLIC_SITE_URL no build.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://dn-fitlog.vercel.app"
).replace(/\/+$/, "");

/** Páginas públicas, listadas no sitemap. O resto do app são dados de cada pessoa. */
export const ROUTES = ["/", "/biblioteca", "/historico", "/cardio"];

export const SITE_NAME = "FitLog";
export const SITE_DESCRIPTION =
  "FitLog é o diário de treino que cabe no bolso: registre séries, monte treinos, bata recordes, estime calorias e frequência cardíaca na esteira e acompanhe sua evolução. Grátis, offline e sem cadastro.";
