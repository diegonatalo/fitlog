import type { ReactNode } from "react";
import NextLink from "next/link";
import { CaretLeftIcon, MoonIcon, SunIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { LogoMark } from "@/components/logo";

type HeaderProps = {
  theme: "light" | "dark";
  onToggleTheme: () => void;
  showBack: boolean;
  onBack: () => void;
  title: string;
  subtitle?: string;
  rightSlot?: ReactNode;
  /** em telas largas, mostra o título grande das abas mesmo com o botão de voltar no celular */
  tabOnDesktop?: boolean;
  /** largura do conteúdo: "wide" nas telas com layout de desktop */
  width?: "narrow" | "wide";
};

/** Botão quadrado de 44px usado no topo (voltar, ajustes, tema). */
export const headerButtonClass =
  "grid size-11 shrink-0 place-items-center rounded-[14px] border border-border bg-card text-foreground transition-colors hover:bg-muted";

export const Header = ({
  theme,
  onToggleTheme,
  showBack,
  onBack,
  title,
  subtitle,
  rightSlot,
  tabOnDesktop = false,
  width = "narrow",
}: HeaderProps) => {
  const container = cn("mx-auto w-full px-4", width === "wide" ? "max-w-2xl md:max-w-[1160px] md:px-10" : "max-w-2xl");
  const themeButton = (
    <button
      onClick={onToggleTheme}
      aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
      className={cn(headerButtonClass, "md:hidden")}
    >
      {theme === "dark" ? <SunIcon size={20} weight="bold" /> : <MoonIcon size={20} weight="bold" />}
    </button>
  );

  // telas internas: barra fixa com voltar e o título menor
  if (showBack && !tabOnDesktop) {
    return (
      <header className="sticky top-0 z-20 bg-background/85 backdrop-blur-md">
        <div className={cn(container, "flex h-16 items-center gap-3")}>
          <button onClick={onBack} aria-label="Voltar" className={headerButtonClass}>
            <CaretLeftIcon size={20} weight="bold" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-extrabold leading-tight font-stretch-semi-expanded">
              {title}
            </h1>
            {subtitle && (
              <p className="truncate font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
          {rightSlot}
          {themeButton}
        </div>
      </header>
    );
  }

  // abas: título grande no fluxo da página, como um placar
  const tabHeader = (
    <header className={cn(showBack && "hidden md:block")}>
      <div className={cn(container, "flex items-end gap-2 pt-6 pb-1 md:pt-10")}>
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center gap-2">
            <NextLink href="/" aria-label="FitLog, página inicial" className="rounded-md md:hidden">
              <LogoMark size={22} />
            </NextLink>
            {subtitle && (
              <p className="truncate font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
          <h1 className="truncate text-4xl leading-none font-extrabold tracking-tight font-stretch-expanded md:text-[56px]">
            {title}
          </h1>
        </div>
        {rightSlot}
        {themeButton}
      </div>
    </header>
  );

  if (!showBack) return tabHeader;

  // no celular, barra com voltar; em telas largas, o título grande das abas
  return (
    <>
      <header className="sticky top-0 z-20 bg-background/85 backdrop-blur-md md:hidden">
        <div className={cn(container, "flex h-16 items-center gap-3")}>
          <button onClick={onBack} aria-label="Voltar" className={headerButtonClass}>
            <CaretLeftIcon size={20} weight="bold" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-extrabold leading-tight font-stretch-semi-expanded">{title}</h1>
          </div>
          {themeButton}
        </div>
      </header>
      {tabHeader}
    </>
  );
};
