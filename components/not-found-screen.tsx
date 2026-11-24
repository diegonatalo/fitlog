import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import { Logo } from "@/components/logo";
import { paths } from "@/lib/paths";

/** Endereço que não existe: avisa e leva de volta ao app. */
export const NotFoundScreen = () => (
  <div className="flex min-h-dvh flex-col bg-background px-6 py-6 text-foreground">
    <Link href="/" aria-label="FitLog, página inicial" className="self-start rounded-xl">
      <Logo size={32} />
    </Link>
    <main id="conteudo" className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-5">
      <div aria-hidden="true" className="rounded-[26px] border border-border bg-card px-5 py-2 font-mono text-[15px]">
        {[1, 2].map((n) => (
          <div key={n} className="flex h-12 items-center gap-4 not-first:border-t not-first:border-border">
            <span className="text-muted-foreground">{n}</span>
            <span className="flex-1 text-foreground/80">404 kg × 1</span>
            <span className="font-sans text-[11px] font-extrabold text-destructive">FALHOU</span>
          </div>
        ))}
      </div>
      <p aria-hidden="true" className="font-mono text-8xl leading-[0.9] font-bold tracking-tighter text-foreground">
        404
      </p>
      <h1 className="text-4xl leading-none font-extrabold font-stretch-expanded">Página não encontrada</h1>
      <p className="text-base leading-relaxed text-muted-foreground">
        Esse endereço não existe no FitLog. Seus treinos continuam no lugar de sempre.
      </p>
      <Link
        href={paths.home}
        className="mt-2 flex h-14 items-center justify-center gap-2.5 rounded-[18px] bg-primary text-base font-extrabold text-primary-foreground font-stretch-semi-expanded"
      >
        Voltar para o app
        <ArrowRightIcon size={18} weight="bold" aria-hidden="true" />
      </Link>
    </main>
  </div>
);
