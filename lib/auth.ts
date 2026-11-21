import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { PASSWORD_MAX, PASSWORD_MIN } from "@/lib/auth-form";
import { SITE_URL } from "@/lib/site";

/**
 * Conta com e-mail e senha. `BETTER_AUTH_SECRET` assina os cookies de sessão.
 * O endereço do site vem de `BETTER_AUTH_URL` (desenvolvimento e testes) ou, na
 * Vercel, do mesmo `SITE_URL` usado no SEO, sem variável a mais.
 */
export const auth = betterAuth({
  appName: "FitLog",
  baseURL: process.env.BETTER_AUTH_URL || (process.env.VERCEL ? SITE_URL : undefined),
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
    transaction: true,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: PASSWORD_MIN,
    maxPasswordLength: PASSWORD_MAX,
    autoSignIn: true,
  },
  // excluir a conta apaga tudo em cascata (user_id nas tabelas do app)
  user: { deleteUser: { enabled: true } },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 dias
    updateAge: 60 * 60 * 24, // renova uma vez por dia de uso
  },
  // limite de tentativas por IP (ligado em produção). Os testes E2E criam
  // muitas contas seguidas do mesmo IP e o desligam com AUTH_RATE_LIMIT=off.
  rateLimit: { enabled: process.env.AUTH_RATE_LIMIT !== "off" && process.env.NODE_ENV === "production" },
  // precisa ser o último: grava o cookie quando o login roda numa Server Action
  plugins: [nextCookies()],
});
