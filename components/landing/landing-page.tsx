import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  CalendarDotsIcon,
  DeviceMobileIcon,
  HeartbeatIcon,
  NotePencilIcon,
  TimerIcon,
  TrophyIcon,
} from "@phosphor-icons/react/ssr";
import { BrandLink } from "@/components/landing/brand-link";
import { LandingThemeToggle } from "@/components/landing/landing-theme-toggle";
import { Logo } from "@/components/logo";
import { SiteFooter } from "@/components/site-footer";
import {
  FACTS,
  FAQ,
  FEATURES,
  FINAL_CTA,
  GALLERY,
  GALLERY_TITLE,
  HERO,
  PHOTOS,
  PRIVACY_LINE,
  SCREENSHOT,
  STEPS,
  type FeatureIcon,
} from "@/lib/landing";
import { SOURCE_URL } from "@/lib/site";

const ICONS: Record<FeatureIcon, typeof TimerIcon> = {
  log: NotePencilIcon,
  record: TrophyIcon,
  calendar: CalendarDotsIcon,
  timer: TimerIcon,
  cardio: HeartbeatIcon,
  devices: DeviceMobileIcon,
};

const WRAP = "mx-auto w-full max-w-[1200px] px-6";
const SECTION_TITLE = "text-[clamp(2rem,4vw,3rem)] leading-none font-extrabold font-stretch-expanded";
const PRIMARY =
  "inline-flex h-15 items-center justify-center gap-2.5 rounded-[18px] bg-primary px-7 text-[17px] font-extrabold text-primary-foreground transition font-stretch-semi-expanded hover:brightness-105";

/** Moldura de celular com um print do app. */
const Phone = ({
  children,
  light = false,
  className = "",
}: {
  children: React.ReactNode;
  light?: boolean;
  className?: string;
}) => (
  <div
    className={`relative overflow-hidden shadow-[0_40px_80px_rgb(0_0_0/0.45)] ${
      light ? "border-[#e1e3dc] bg-[#f3f4ef]" : "border-[#1f242c] bg-[#0b0d10]"
    } ${className}`}
  >
    {children}
  </div>
);

/** Página inicial: apresenta o FitLog e leva ao app (`/app`). */
export const LandingPage = () => (
  <div className="flex min-h-full flex-col bg-background text-foreground">
    <header className={`${WRAP} flex flex-wrap items-center gap-4 py-5`}>
      <BrandLink />
      <nav aria-label="Seções" className="flex flex-1 justify-center gap-6 text-sm font-semibold max-md:hidden">
        <a href="#como-funciona" className="text-muted-foreground hover:text-foreground">
          Como funciona
        </a>
        <a href="#recursos" className="text-muted-foreground hover:text-foreground">
          Recursos
        </a>
        <a href="#perguntas" className="text-muted-foreground hover:text-foreground">
          Perguntas
        </a>
      </nav>
      <div className="ml-auto flex items-center gap-2">
        <LandingThemeToggle className="bg-card text-foreground hover:bg-muted" />
        <Link
          href="/app"
          className="inline-flex h-11 items-center rounded-[14px] bg-primary px-4 text-sm font-extrabold text-primary-foreground max-sm:hidden"
        >
          Abrir o app
        </Link>
      </div>
    </header>

    <main id="conteudo" className="flex flex-1 flex-col">
      <section className={`${WRAP} flex flex-wrap items-center gap-14 pt-12 pb-18`} aria-labelledby="titulo">
        <div className="flex min-w-0 flex-[999_1_520px] flex-col gap-6">
          <p className="flex items-center gap-2 font-mono text-[13px] font-bold uppercase tracking-[0.12em] text-accent-text">
            <span aria-hidden="true">●</span> {HERO.kicker}
          </p>
          <h1
            id="titulo"
            className="text-[clamp(2.6rem,6vw,4.75rem)] leading-[0.98] font-extrabold tracking-tight text-balance font-stretch-expanded"
          >
            {HERO.title}
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground">{HERO.subtitle}</p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link href="/app" className={PRIMARY}>
              Abrir o app
              <ArrowRightIcon size={18} weight="bold" aria-hidden="true" />
            </Link>
            <a
              href="#como-funciona"
              className="inline-flex h-15 items-center rounded-[18px] border border-input px-6 font-bold hover:bg-muted"
            >
              Como funciona
            </a>
          </div>
          <p className="text-sm text-muted-foreground">{HERO.note}</p>
        </div>

        <div className="relative flex flex-[1_1_300px] justify-center">
          <Image
            src={PHOTOS.hero.src}
            alt=""
            width={1600}
            height={1068}
            priority
            sizes="(min-width: 768px) 400px, 100vw"
            className="absolute inset-x-[-40px] inset-y-10 h-[calc(100%-80px)] w-[calc(100%+80px)] max-w-none rounded-[36px] object-cover opacity-35"
          />
          <Phone className="w-[280px] rounded-[44px] border-8">
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
          </Phone>
        </div>
      </section>

      <div className="bg-accent text-accent-foreground">
        <ul
          className={`${WRAP} flex flex-wrap justify-between gap-x-6 gap-y-2.5 py-[18px] text-[15px] font-extrabold font-stretch-semi-expanded`}
        >
          {FACTS.map((fact, i) => (
            <li key={fact} className="flex items-center gap-6">
              {i > 0 && (
                <span aria-hidden="true" className="font-mono max-sm:hidden">
                  ×
                </span>
              )}
              {fact}
            </li>
          ))}
        </ul>
      </div>

      <section id="como-funciona" className={`${WRAP} scroll-mt-6 pt-24`} aria-labelledby="titulo-como">
        <h2 id="titulo-como" className={`${SECTION_TITLE} mb-10`}>
          Como funciona
        </h2>
        <ol className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex flex-col gap-3.5 rounded-[28px] border border-border bg-card p-7">
              <span className="font-mono text-[56px] leading-none font-bold text-accent-text">0{index + 1}</span>
              <h3 className="text-[22px] font-extrabold font-stretch-semi-expanded">{step.title}</h3>
              <p className="leading-relaxed text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="recursos" className={`${WRAP} scroll-mt-6 pt-24`} aria-labelledby="titulo-recursos">
        <h2 id="titulo-recursos" className={`${SECTION_TITLE} mb-10`}>
          Recursos
        </h2>
        <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] border-t border-l border-border">
          {FEATURES.map((feature) => {
            const Icon = ICONS[feature.icon];
            return (
              <li key={feature.title} className="flex flex-col gap-3 border-r border-b border-border p-7">
                <span className="grid size-12 place-items-center rounded-[15px] bg-muted text-accent-text">
                  <Icon size={22} weight="fill" aria-hidden="true" />
                </span>
                <h3 className="mt-1 text-[19px] font-extrabold">{feature.title}</h3>
                <p className="text-[15px] leading-relaxed text-muted-foreground">{feature.text}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={`${WRAP} pt-24`} aria-labelledby="titulo-telas">
        <h2 id="titulo-telas" className={`${SECTION_TITLE} mb-10`}>
          {GALLERY_TITLE}
        </h2>
        <div className="flex flex-wrap justify-center gap-6">
          {GALLERY.map((shot) => (
            <Phone key={shot.src} light={shot.light} className="w-[260px] rounded-[40px] border-[7px]">
              <Image src={shot.src} alt={shot.alt} width={390} height={844} sizes="260px" className="block h-auto w-full" />
            </Phone>
          ))}
        </div>
      </section>

      <section className={`${WRAP} pt-24`} aria-label="Privacidade">
        <div className="relative flex min-h-80 items-end overflow-hidden rounded-[36px]">
          <Image
            src={PHOTOS.rack.src}
            alt={PHOTOS.rack.alt}
            fill
            sizes="(min-width: 1200px) 1152px, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 from-10% to-black/20" aria-hidden="true" />
          <p className="relative max-w-3xl p-9 text-[clamp(1.25rem,2.4vw,1.75rem)] leading-snug font-bold text-white">
            {PRIVACY_LINE}{" "}
            <Link href="/privacidade" className="whitespace-nowrap text-accent underline decoration-2 underline-offset-4">
              Ler a política
            </Link>
          </p>
        </div>
      </section>

      <section id="perguntas" className="mx-auto w-full max-w-[860px] scroll-mt-6 px-6 pt-24" aria-labelledby="titulo-faq">
        <h2 id="titulo-faq" className={`${SECTION_TITLE} mb-8`}>
          Perguntas
        </h2>
        <div className="flex flex-col gap-2.5">
          {FAQ.map((item, i) => (
            <details key={item.question} open={i === 0} className="group rounded-[22px] border border-border bg-card px-5.5">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-extrabold [&::-webkit-details-marker]:hidden">
                {item.question}
                <span aria-hidden="true" className="font-mono text-xl text-accent-text transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="pb-5 text-[15px] leading-relaxed text-muted-foreground">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={`${WRAP} pt-24`} aria-labelledby="titulo-final">
        <div className="flex flex-wrap items-end justify-between gap-7 rounded-[36px] bg-accent p-[clamp(32px,6vw,72px)] text-accent-foreground">
          <h2
            id="titulo-final"
            className="max-w-2xl text-[clamp(2.2rem,5vw,4rem)] leading-[0.98] font-extrabold font-stretch-expanded"
          >
            {FINAL_CTA.title}
          </h2>
          <Link
            href="/app/treino/novo"
            className="inline-flex h-16 items-center gap-2.5 rounded-[20px] bg-accent-foreground px-7 text-[17px] font-extrabold text-accent hover:opacity-90"
          >
            {FINAL_CTA.action}
            <ArrowRightIcon size={18} weight="bold" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>

    {/* o rodapé é o do modelo (SiteFooter); só a marca ao lado é do FitLog */}
    <div className={`${WRAP} mt-12 flex flex-wrap items-center justify-between gap-4 py-4 [&_footer]:border-0 [&_footer]:px-0`}>
      <Logo size={28} />
      <SiteFooter privacy terms sourceUrl={SOURCE_URL} authorUrl="https://diegonatalo.dev" />
    </div>
  </div>
);
