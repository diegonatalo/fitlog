import type { NextConfig } from "next";

export type Redirect = Awaited<ReturnType<NonNullable<NextConfig["redirects"]>>>[number];

/** Telas que ficavam na raiz antes da landing; `:path+` cobre também as rotas com id. */
const MOVED = ["agenda", "treinos", "biblioteca", "historico", "cardio", "ajustes", "exercicio", "treino", "sessao"];

/**
 * Redirecionamentos do projeto, lidos pelo `next.config.ts` (que é igual em todos os projetos).
 * O app saiu da raiz para `/app` quando a landing entrou em `/`.
 */
// Duas regras por tela: com `:path*` a Vercel manda `/agenda` para `/app/agenda/` (com barra),
// o que custa um segundo redirecionamento.
export const REDIRECTS: Redirect[] = MOVED.flatMap((name) => [
  { source: `/${name}`, destination: `/app/${name}`, permanent: true },
  { source: `/${name}/:path+`, destination: `/app/${name}/:path+`, permanent: true },
]);
