import Image from "next/image";
import Link from "next/link";
import {
  CalendarDotsIcon,
  DeviceMobileIcon,
  HeartbeatIcon,
  LightningIcon,
  NotePencilIcon,
  ShieldCheckIcon,
  TimerIcon,
  TrophyIcon,
} from "@phosphor-icons/react/ssr";
import { BrandLink } from "@/components/landing/brand-link";
import { LandingThemeToggle } from "@/components/landing/landing-theme-toggle";
import { SiteFooter } from "@/components/site-footer";
import { FACTS, FAQ, FEATURES, HERO, PHOTOS, SCREENSHOT, STEPS, type FeatureIcon } from "@/lib/landing";
import { SOURCE_URL } from "@/lib/site";

const ICONS: Record<FeatureIcon, typeof TimerIcon> = {
  log: NotePencilIcon,
  record: TrophyIcon,
  calendar: CalendarDotsIcon,
  timer: TimerIcon,
  cardio: HeartbeatIcon,
  devices: DeviceMobileIcon,
};

const WRAP = "mx-auto w-full max-w-6xl px-5";
const LIME_BUTTON =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 font-black uppercase tracking-wide text-accent-foreground transition hover:brightness-110";
const GHOST_BUTTON =
  "inline-flex items-center justify-center rounded-xl border border-white/30 px-6 py-3.5 font-bold uppercase tracking-wide text-white transition hover:bg-white/10";

/** Print do app no celular, claro ou escuro conforme o tema da página. */
const PhoneShot = () => (
  <div className="mx-auto w-full max-w-[280px] -rotate-2 overflow-hidden rounded-[2.2rem] border-[7px] border-black bg-card shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/10">
    <Image
      src={SCREENSHOT.light}
      alt={SCREENSHOT.alt}
      width={390}
      height={844}
      priority
      sizes="280px"
      className="block h-auto w-full dark:hidden"
    />
    <Image
      src={SCREENSHOT.dark}
      alt={SCREENSHOT.alt}
      width={390}
      height={844}
      priority
      sizes="280px"
      className="hidden h-auto w-full dark:block"
    />
  </div>
);

/** Página inicial: apresenta o FitLog e leva ao app (`/app`). */
export const LandingPage = () => (
  <div className="flex min-h-full flex-col bg-background text-foreground">
    {/* Topo sempre escuro, por cima da foto. */}
    <header className="absolute inset-x-0 top-0 z-20 text-white">
      <div className={`${WRAP} flex h-16 items-center gap-3`}>
        <BrandLink />
        <div className="ml-auto flex items-center gap-2">
          <LandingThemeToggle className="text-white hover:bg-white/10" />
          <Link href="/app" className={`${LIME_BUTTON} px-4 py-2 text-sm max-sm:hidden`}>
            Abrir o app
          </Link>
        </div>
      </div>
    </header>

    <main id="conteudo" className="flex flex-1 flex-col">
      <section className="relative isolate overflow-hidden bg-black text-white" aria-labelledby="titulo">
        <Image src={PHOTOS.hero.src} alt="" fill priority sizes="100vw" className="-z-10 object-cover object-center opacity-60" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/85 to-black/20" aria-hidden="true" />
        <div className={`${WRAP} grid items-center gap-12 pb-20 pt-32 lg:grid-cols-[1fr_300px] lg:pb-28 lg:pt-40`}>
          <div className="flex flex-col gap-6">
            <p className="inline-flex w-fit items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-accent">
              <LightningIcon size={14} weight="fill" aria-hidden="true" />
              {HERO.kicker}
            </p>
            <h1 id="titulo" className="text-[2.5rem] font-black uppercase leading-[0.95] tracking-tight text-balance sm:text-7xl">
              O caderninho da academia, <span className="text-accent">no bolso.</span>
            </h1>
            <p className="max-w-xl text-lg text-pretty text-white/75">{HERO.subtitle}</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/app" className={LIME_BUTTON}>
                Abrir o FitLog
              </Link>
              <a href="#como-funciona" className={GHOST_BUTTON}>
                Como funciona
              </a>
            </div>
            <p className="text-sm text-white/60">{HERO.note}</p>
          </div>
          <PhoneShot />
        </div>
      </section>

      <div className="bg-accent text-accent-foreground">
        <ul className={`${WRAP} grid grid-cols-2 gap-x-6 gap-y-3 py-5 text-sm font-black uppercase tracking-wide md:grid-cols-4`}>
          {FACTS.map((fact) => (
            <li key={fact} className="flex items-center gap-2">
              <span aria-hidden="true">/</span>
              {fact}
            </li>
          ))}
        </ul>
      </div>

      <section id="como-funciona" className={`${WRAP} scroll-mt-20 py-20`} aria-labelledby="titulo-como">
        <h2 id="titulo-como" className="text-3xl font-black uppercase tracking-tight sm:text-4xl">
          Do vestiário ao recorde
        </h2>
        <ol className="mt-10 divide-y divide-border border-y border-border">
          {STEPS.map((step, index) => (
            <li key={step.title} className="grid gap-2 py-7 sm:grid-cols-[7rem_1fr_2fr] sm:items-baseline sm:gap-8">
              <span className="font-mono text-5xl font-black text-accent">0{index + 1}</span>
              <h3 className="text-xl font-bold">{step.title}</h3>
              <p className="text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-muted/60 py-20" aria-labelledby="titulo-recursos">
        <div className={`${WRAP} grid items-start gap-10 lg:grid-cols-[2fr_3fr]`}>
          <div className="relative overflow-hidden rounded-3xl lg:sticky lg:top-8">
            <Image
              src={PHOTOS.rack.src}
              alt={PHOTOS.rack.alt}
              width={1600}
              height={1036}
              sizes="(min-width: 1024px) 440px, 100vw"
              className="h-72 w-full object-cover lg:h-[30rem]"
            />
            <p className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-2xl font-black uppercase leading-tight text-white">
              Feito para usar entre uma série e outra
            </p>
          </div>
          <div>
            <h2 id="titulo-recursos" className="sr-only">
              Recursos
            </h2>
            <ul className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
              {FEATURES.map((feature) => {
                const Icon = ICONS[feature.icon];
                return (
                  <li key={feature.title} className="flex flex-col gap-2">
                    <span className="grid size-11 place-items-center rounded-xl bg-accent text-accent-foreground">
                      <Icon size={22} weight="bold" aria-hidden="true" />
                    </span>
                    <h3 className="text-lg font-bold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.text}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      <section className={`${WRAP} grid gap-10 py-20 lg:grid-cols-[1fr_1.3fr]`} aria-labelledby="titulo-faq">
        <div className="flex flex-col gap-4">
          <h2 id="titulo-faq" className="text-3xl font-black uppercase tracking-tight sm:text-4xl">
            Perguntas frequentes
          </h2>
          <p className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5 text-sm">
            <ShieldCheckIcon size={22} weight="bold" className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
            <span>
              Seus treinos são só seus: ficam na sua conta, sem propaganda nem cookies de rastreamento.{" "}
              <Link href="/privacidade" className="font-semibold underline underline-offset-2">
                Leia a política de privacidade
              </Link>
              .
            </span>
          </p>
        </div>
        <div className="divide-y divide-border border-y border-border">
          {FAQ.map((item) => (
            <details key={item.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">
                {item.question}
                <span className="text-2xl text-accent transition group-open:rotate-45" aria-hidden="true">
                  +
                </span>
              </summary>
              <p className="mt-3 text-muted-foreground">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="bg-black text-white" aria-labelledby="titulo-final">
        <div className={`${WRAP} flex flex-col items-start justify-between gap-6 py-16 md:flex-row md:items-center`}>
          <h2 id="titulo-final" className="text-4xl font-black uppercase leading-none tracking-tight sm:text-5xl">
            Bora <span className="text-accent">treinar?</span>
          </h2>
          <Link href="/app/treino/novo" className={LIME_BUTTON}>
            Montar meu primeiro treino
          </Link>
        </div>
      </section>
    </main>
    <SiteFooter privacy terms sourceUrl={SOURCE_URL} authorUrl="https://diegonatalo.dev" />
  </div>
);
