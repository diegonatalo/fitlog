"use client";

import Link from "next/link";
import { AuthForm, type AuthMode } from "@/components/auth-form";
import { BrandLink } from "@/components/landing/brand-link";
import { Logo } from "@/components/logo";
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

/** A frase do bloco verde da tela de entrar. */
const HERO_LINE = "Cada série conta.";

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
  const signIn = mode === "sign-in";
  return (
    <div className="flex min-h-full flex-col bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pt-4 pb-8 sm:pt-8">
        {signIn ? (
          // entrar: o bloco verde da marca no topo
          <div className="relative flex h-72 flex-col justify-between overflow-hidden rounded-[32px] bg-accent p-6 text-accent-foreground">
            <div className="flex items-center justify-between gap-3">
              <Link href="/" aria-label="FitLog, página inicial" className="rounded-xl">
                <Logo size={34} tone="ink" />
              </Link>
              <LandingThemeToggle className="border-accent-foreground/20 text-accent-foreground hover:bg-accent-foreground/10" />
            </div>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-16 -right-2 font-mono text-8xl leading-none font-bold tracking-tighter opacity-15"
            >
              ×10
            </span>
            <p className="max-w-[17rem] text-[34px] leading-[1.05] font-extrabold font-stretch-semi-expanded">
              {HERO_LINE}
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <BrandLink />
            <LandingThemeToggle />
          </div>
        )}

        <main id="conteudo" className={signIn ? "pt-6" : "pt-8"}>
          <h1
            className={
              signIn
                ? "text-3xl leading-none font-extrabold tracking-tight font-stretch-expanded"
                : "text-4xl leading-none font-extrabold tracking-tight font-stretch-expanded"
            }
          >
            {copy.title}
          </h1>
          <p className="mt-3 mb-6 text-[15px] text-muted-foreground text-pretty">{copy.lead}</p>
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
            className="font-bold text-foreground underline decoration-accent decoration-2 underline-offset-4"
          >
            {copy.switchLabel}
          </Link>
        </p>
      </div>
      <SiteFooter privacy terms sourceUrl={SOURCE_URL} authorUrl="https://diegonatalo.dev" />
    </div>
  );
};
