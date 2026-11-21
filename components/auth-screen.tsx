"use client";

import Link from "next/link";
import { AuthForm, type AuthMode } from "@/components/auth-form";
import { BrandLink } from "@/components/landing/brand-link";
import { LandingThemeToggle } from "@/components/landing/landing-theme-toggle";
import { SiteFooter } from "@/components/site-footer";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage, safeRedirect, type SignUpInput } from "@/lib/auth-form";
import { RETURN_PARAM, paths } from "@/lib/paths";
import { SOURCE_URL } from "@/lib/site";

const COPY = {
  "sign-in": {
    title: "Entrar",
    lead: "Seus treinos, séries e histórico em qualquer aparelho.",
    switchText: "Ainda não tem conta?",
    switchLabel: "Criar conta",
    switchHref: paths.signUp,
  },
  "sign-up": {
    title: "Criar conta",
    lead: "Grátis. Seus treinos ficam salvos na sua conta.",
    switchText: "Já tem conta?",
    switchLabel: "Entrar",
    switchHref: paths.signIn,
  },
} as const;

/** Lido só no envio, para a página não depender da URL ao renderizar. */
const returnTo = () =>
  safeRedirect(new URLSearchParams(window.location.search).get(RETURN_PARAM));

const send = async (mode: AuthMode, values: SignUpInput) => {
  const { error } =
    mode === "sign-up"
      ? await authClient.signUp.email(values)
      : await authClient.signIn.email({ email: values.email, password: values.password });
  if (error) return authErrorMessage(error);
  // navegação completa: o app abre do zero, já com os dados da conta
  window.location.assign(returnTo());
  return null;
};

export const AuthScreen = ({ mode }: { mode: AuthMode }) => {
  const copy = COPY[mode];
  return (
    <div className="flex min-h-full flex-col bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-6 sm:py-10">
        <div className="mb-8 flex items-center justify-between gap-3">
          <BrandLink />
          <LandingThemeToggle />
        </div>

        <main id="conteudo" className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h1 className="text-2xl font-bold tracking-tight">{copy.title}</h1>
          <p className="mt-1 mb-6 text-sm text-muted-foreground text-pretty">{copy.lead}</p>
          <AuthForm
            mode={mode}
            onSubmit={(values) =>
              send(mode, values).catch(() => authErrorMessage(null))
            }
          />
        </main>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {copy.switchText}{" "}
          <Link
            href={copy.switchHref}
            className="font-semibold text-accent underline underline-offset-2"
          >
            {copy.switchLabel}
          </Link>
        </p>
      </div>
      <SiteFooter privacy terms sourceUrl={SOURCE_URL} authorUrl="https://diegonatalo.dev" />
    </div>
  );
};
