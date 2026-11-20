import Image from "next/image";
import Link from "next/link";
import {
  CalendarDotsIcon,
  DeviceMobileIcon,
  HeartbeatIcon,
  NotePencilIcon,
  ShieldCheckIcon,
  TimerIcon,
  TrophyIcon,
} from "@phosphor-icons/react/ssr";
import { BrandLink } from "@/components/landing/brand-link";
import { LandingThemeToggle } from "@/components/landing/landing-theme-toggle";
import { SiteFooter } from "@/components/site-footer";
import { FAQ, FEATURES, HERO, SCREENSHOT, STEPS, type FeatureIcon } from "@/lib/landing";
import { SOURCE_URL } from "@/lib/site";

const ICONS: Record<FeatureIcon, typeof TimerIcon> = {
  log: NotePencilIcon,
  record: TrophyIcon,
  calendar: CalendarDotsIcon,
  timer: TimerIcon,
  cardio: HeartbeatIcon,
  offline: DeviceMobileIcon,
};

const SECTION = "mx-auto w-full max-w-5xl px-4";
const H2 = "text-2xl font-bold tracking-tight text-balance sm:text-3xl";
const CARD = "rounded-2xl border border-border bg-card p-6 text-card-foreground";
const PRIMARY =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground transition-opacity hover:opacity-90";
const SECONDARY =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-border px-5 py-3 font-semibold transition-colors hover:bg-muted";

/** Print do app no celular, claro ou escuro conforme o tema da página. */
const PhoneShot = () => (
  <div className="mx-auto w-full max-w-[300px] overflow-hidden rounded-[2rem] border-8 border-foreground/90 bg-card shadow-2xl">
    <Image
      src={SCREENSHOT.light}
      alt={SCREENSHOT.alt}
      width={390}
      height={844}
      priority
      sizes="300px"
      className="block h-auto w-full dark:hidden"
    />
    <Image
      src={SCREENSHOT.dark}
      alt={SCREENSHOT.alt}
      width={390}
      height={844}
      priority
      sizes="300px"
      className="hidden h-auto w-full dark:block"
    />
  </div>
);

/** Página inicial: apresenta o FitLog e leva ao app (`/app`). */
export const LandingPage = () => (
  <div className="flex min-h-full flex-col bg-background text-foreground">
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-3 px-4">
        <BrandLink />
        <div className="ml-auto flex items-center gap-2">
          <LandingThemeToggle />
          <Link href="/app" className={`${PRIMARY} py-2`}>
            Abrir o app
          </Link>
        </div>
      </div>
    </header>

    <main id="conteudo" className="flex flex-1 flex-col gap-20 pb-20">
      <section
        className={`${SECTION} grid items-center gap-10 pt-12 sm:pt-16 md:grid-cols-[1fr_300px]`}
        aria-labelledby="titulo"
      >
        <div className="flex flex-col gap-5">
          <p className="text-sm font-bold tracking-wide text-accent uppercase">{HERO.kicker}</p>
          <h1 id="titulo" className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            {HERO.title}
          </h1>
          <p className="text-lg text-pretty text-muted-foreground">{HERO.subtitle}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/app" className={PRIMARY}>
              Abrir o FitLog
            </Link>
            <a href="#como-funciona" className={SECONDARY}>
              Ver como funciona
            </a>
          </div>
          <p className="text-sm text-muted-foreground">{HERO.note}</p>
        </div>
        <PhoneShot />
      </section>

      <section id="como-funciona" className={`${SECTION} scroll-mt-20`} aria-labelledby="titulo-como">
        <h2 id="titulo-como" className={H2}>
          Como funciona
        </h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className={`${CARD} flex flex-col gap-3`}>
              <span className="grid size-9 place-items-center rounded-xl bg-accent font-bold text-accent-foreground">
                {index + 1}
              </span>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={SECTION} aria-labelledby="titulo-recursos">
        <h2 id="titulo-recursos" className={H2}>
          Feito para usar entre uma série e outra
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = ICONS[feature.icon];
            return (
              <li key={feature.title} className={`${CARD} flex flex-col gap-2`}>
                <Icon size={24} weight="bold" className="text-accent" aria-hidden="true" />
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.text}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={SECTION} aria-labelledby="titulo-privacidade">
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-muted p-8">
          <ShieldCheckIcon size={28} weight="bold" className="text-accent" aria-hidden="true" />
          <h2 id="titulo-privacidade" className={H2}>
            Seus treinos são só seus
          </h2>
          <p className="max-w-2xl text-pretty">
            Tudo fica guardado no seu aparelho. Não há conta, servidor guardando seus treinos nem cookies de
            rastreamento.{" "}
            <Link href="/privacidade" className="font-semibold underline underline-offset-2">
              Leia a política de privacidade
            </Link>
            .
          </p>
        </div>
      </section>

      <section className={SECTION} aria-labelledby="titulo-faq">
        <h2 id="titulo-faq" className={H2}>
          Perguntas frequentes
        </h2>
        <dl className="mt-6 grid gap-4 md:grid-cols-2">
          {FAQ.map((item) => (
            <div key={item.question} className={CARD}>
              <dt className="font-semibold">{item.question}</dt>
              <dd className="mt-2 text-muted-foreground">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={`${SECTION} text-center`} aria-labelledby="titulo-final">
        <h2 id="titulo-final" className={H2}>
          Bora treinar?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Monte o primeiro treino em poucos minutos e leve no bolso.
        </p>
        <Link href="/app/treino/novo" className={`${PRIMARY} mt-6`}>
          Montar meu primeiro treino
        </Link>
      </section>
    </main>
    <SiteFooter privacy terms sourceUrl={SOURCE_URL} authorUrl="https://diegonatalo.dev" />
  </div>
);
