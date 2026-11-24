"use client";

import {
  BarbellIcon,
  CalendarBlankIcon,
  ChartLineUpIcon,
  ClockCounterClockwiseIcon,
  GearSixIcon,
  HouseIcon,
  MoonIcon,
  PersonSimpleRunIcon,
  PlayIcon,
  SunIcon,
} from "@phosphor-icons/react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useNavigate } from "@/lib/router";
import { paths } from "@/lib/paths";
import { resolvePlan } from "@/lib/schedule";
import { cn } from "@/lib/cn";
import { useAccount, useStore } from "@/hooks/use-store";
import { useToday } from "@/hooks/use-today";
import { Logo } from "@/components/logo";

const ITEMS: { to: string; label: string; icon: typeof HouseIcon }[] = [
  { to: paths.home, label: "Início", icon: HouseIcon },
  { to: paths.schedule, label: "Agenda", icon: CalendarBlankIcon },
  { to: paths.workouts, label: "Treinos", icon: BarbellIcon },
  { to: paths.history, label: "Histórico", icon: ClockCounterClockwiseIcon },
  { to: paths.progress, label: "Progresso", icon: ChartLineUpIcon },
  { to: paths.cardio, label: "Cardio", icon: PersonSimpleRunIcon },
];

type SideNavProps = {
  theme: "light" | "dark";
  onToggleTheme: () => void;
};

/** Navegação das telas largas (md para cima): substitui a barra de baixo e os botões do topo. */
export const SideNav = ({ theme, onToggleTheme }: SideNavProps) => {
  const pathname = usePathname();
  const store = useStore();
  const account = useAccount();
  const today = useToday();
  const navigate = useNavigate();
  const active = store.activeSession;

  // o treino de hoje, se houver um na agenda; senão um treino livre
  const start = () => {
    if (active) return navigate(paths.session(active.id));
    const plan = today ? resolvePlan(store.schedule, today)?.plan : undefined;
    const workout = plan?.type === "workout" ? store.workouts.find((w) => w.id === plan.workoutId) ?? null : null;
    const session = store.startSession(workout);
    navigate(paths.session(session.id));
  };

  return (
    <nav
      aria-label="Principal"
      className="fixed inset-y-0 left-0 z-30 hidden w-62 flex-col gap-7 border-r border-border bg-background px-4 py-6 md:flex"
    >
      <NextLink href="/" aria-label="FitLog, página inicial" className="self-start rounded-xl px-2">
        <Logo size={32} />
      </NextLink>

      <ul className="flex flex-col gap-1">
        {ITEMS.map(({ to, label, icon: Icon }) => {
          const current = pathname === to;
          return (
            <li key={to}>
              <NextLink
                href={to}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "flex h-11.5 items-center gap-3 rounded-[14px] px-3 text-[15px] transition-colors",
                  current
                    ? "bg-accent font-extrabold text-accent-foreground"
                    : "font-semibold text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon size={20} weight={current ? "fill" : "regular"} aria-hidden="true" />
                {label}
              </NextLink>
            </li>
          );
        })}
      </ul>

      <button
        onClick={start}
        className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary text-[15px] font-extrabold text-primary-foreground font-stretch-semi-expanded"
      >
        <PlayIcon size={16} weight="fill" aria-hidden="true" />
        {active ? "Continuar treino" : "Iniciar treino"}
      </button>

      <div className="mt-auto flex flex-col gap-1 border-t border-border pt-4">
        <NextLink
          href={paths.settings}
          aria-current={pathname === paths.settings ? "page" : undefined}
          className={cn(
            "flex h-11 items-center gap-3 rounded-[14px] px-3 text-[15px] font-semibold hover:bg-muted",
            pathname === paths.settings ? "text-foreground" : "text-muted-foreground",
          )}
        >
          <GearSixIcon size={20} aria-hidden="true" />
          Ajustes
        </NextLink>
        <div className="flex items-center gap-2.5 px-2 pt-2">
          <span
            aria-hidden="true"
            className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent font-extrabold text-accent-foreground font-stretch-expanded"
          >
            {account.name.trim().charAt(0).toUpperCase() || "?"}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold">{account.name}</span>
            <span className="block truncate text-xs text-muted-foreground">{account.email}</span>
          </span>
          <button
            onClick={onToggleTheme}
            aria-label={theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
            className="grid size-9 shrink-0 place-items-center rounded-xl border border-border bg-card hover:bg-muted"
          >
            {theme === "dark" ? <SunIcon size={16} weight="bold" /> : <MoonIcon size={16} weight="bold" />}
          </button>
        </div>
      </div>
    </nav>
  );
};
