"use client";

import { useMemo, type ReactNode } from "react";
import { GearSixIcon } from "@phosphor-icons/react";
import { Link, matchPath, useLocation, useNavigate } from "@/lib/router";
import { Header } from "./header";
import { BottomNav } from "./bottom-nav";
import { patterns, paths, tabPatterns } from "@/lib/paths";
import { useStore } from "@/hooks/use-store";
import { useTheme } from "@/hooks/use-theme";
import type { Store } from "@/hooks/use-workout-store";

interface HeaderInfo {
  title: string;
  subtitle?: string;
}

type Params = Record<string, string | undefined>;

/**
 * Header copy per route. Ordered most-specific first so static segments
 * (/treino/novo) are considered before dynamic ones (/treino/:id).
 */
const HEADER_RULES: {
  pattern: string;
  resolve: (params: Params, store: Store) => HeaderInfo;
}[] = [
  {
    pattern: patterns.home,
    resolve: () => ({ title: "FitLog", subtitle: "Seus treinos de hoje" }),
  },
  {
    pattern: patterns.library,
    resolve: () => ({ title: "Biblioteca", subtitle: "Todos os exercícios" }),
  },
  {
    pattern: patterns.history,
    resolve: () => ({ title: "Histórico", subtitle: "Treinos e cardio" }),
  },
  {
    pattern: patterns.cardio,
    resolve: () => ({ title: "Cardio", subtitle: "Calculadora de esteira" }),
  },
  { pattern: patterns.settings, resolve: () => ({ title: "Ajustes" }) },
  { pattern: patterns.newWorkout, resolve: () => ({ title: "Novo treino" }) },
  {
    pattern: patterns.editWorkout,
    resolve: () => ({ title: "Editar treino" }),
  },
  {
    pattern: patterns.exercise,
    resolve: (p, store) => ({
      title: store.exercises.find((e) => e.id === p.id)?.name ?? "Exercício",
    }),
  },
  {
    pattern: patterns.workout,
    resolve: (p, store) => ({
      title: store.workouts.find((w) => w.id === p.id)?.name ?? "Treino",
    }),
  },
  {
    pattern: patterns.session,
    resolve: (p, store) => ({
      title:
        store.sessions.find((s) => s.id === p.id)?.name ??
        "Treino em andamento",
      subtitle: "Sessão ativa",
    }),
  },
  {
    pattern: patterns.sessionDetail,
    resolve: (p, store) => ({
      title: store.sessions.find((s) => s.id === p.id)?.name ?? "Sessão",
    }),
  },
];

export const AppShell = ({ children }: { children: ReactNode }) => {
  const { theme, toggle: onToggleTheme } = useTheme();
  const store = useStore();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isTab = useMemo(
    () => tabPatterns.some((p) => matchPath(p, pathname)),
    [pathname],
  );

  const header = useMemo<HeaderInfo>(() => {
    for (const rule of HEADER_RULES) {
      const match = matchPath(rule.pattern, pathname);
      if (match) return rule.resolve(match.params, store);
    }
    return { title: "Treino Log" };
  }, [pathname, store]);

  return (
    <div className="flex min-h-dvh flex-col">
      <Header
        theme={theme}
        onToggleTheme={onToggleTheme}
        showBack={!isTab}
        onBack={() => navigate(-1)}
        title={header.title}
        subtitle={header.subtitle}
        rightSlot={
          isTab && (
            <Link
              to={paths.settings}
              aria-label="Ajustes"
              className="grid size-9 place-items-center rounded-full text-foreground transition-colors hover:bg-muted"
            >
              <GearSixIcon size={20} weight="bold" />
            </Link>
          )
        }
      />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-28 pt-4">
        {children}
      </main>

      {isTab && <BottomNav />}
    </div>
  );
};
