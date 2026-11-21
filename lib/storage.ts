import type { ThemeColors } from "@/lib/theme";

/**
 * O que ainda fica no navegador: só o tema. Treinos, séries e o resto moram no
 * banco, ligados à conta (veja `lib/db/schema.ts`).
 */
export const THEME_KEY = "fitlog:theme:v1";

/** Cor da barra do navegador em cada tema (fundo do app). */
export const THEME_COLORS: ThemeColors = { dark: "#14161d", light: "#f4f6f9" };

/** Ids gerados no navegador, para a tela atualizar antes de o servidor responder. */
export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
