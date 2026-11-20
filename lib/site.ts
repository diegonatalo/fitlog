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
export const ROUTES = [
  "/",
  "/app",
  "/app/agenda",
  "/app/treinos",
  "/app/biblioteca",
  "/app/historico",
  "/app/cardio",
  "/privacidade",
  "/termos",
];

/**
 * Contato para pedidos sobre dados pessoais (LGPD, art. 18), mostrado em `/privacidade`.
 * TODO: trocar pelo e-mail definitivo; o standard-kit avisa enquanto este for o provisório.
 */
export const PRIVACY_EMAIL = "contato@exemplo.com.br";

/** Repositório público, no rodapé. */
export const SOURCE_URL = "https://github.com/diegonatalo/fitlog";

export const SITE_NAME = "FitLog";
export const SITE_DESCRIPTION =
  "FitLog é o diário de treino que cabe no bolso: registre séries, monte treinos, bata recordes, estime calorias e frequência cardíaca na esteira e acompanhe sua evolução. Grátis, offline e sem cadastro.";
