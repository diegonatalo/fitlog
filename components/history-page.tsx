"use client";

import {
  CaretRightIcon,
  ChartLineUpIcon,
  ClockCounterClockwiseIcon,
  ListChecksIcon,
} from "@phosphor-icons/react";
import { Link, useSearchParams } from "@/lib/router";
import { CardioHistory } from "@/components/cardio-history";
import { EmptyState } from "@/components/empty-state";
import { paths } from "@/lib/paths";
import { WEEKDAY_SHORT } from "@/lib/dates";
import { cn } from "@/lib/cn";
import { formatDuration, formatTime, relativeDay } from "@/lib/format";
import { useStore } from "@/hooks/use-store";

type Kind = "workouts" | "cardio";

const KINDS: { value: Kind; label: string }[] = [
  { value: "workouts", label: "Treinos" },
  { value: "cardio", label: "Cardio" },
];

export const HistoryPage = () => {
  const [params, setParams] = useSearchParams();
  const kind: Kind = params.get("tipo") === "cardio" ? "cardio" : "workouts";

  const select = (next: Kind) =>
    setParams(next === "cardio" ? { tipo: "cardio" } : {}, { replace: true });

  return (
    <div className="flex flex-col gap-4">
      <div
        role="group"
        aria-label="Tipo de histórico"
        className="grid grid-cols-2 gap-1 rounded-[14px] border border-border bg-card p-1 text-sm"
      >
        {KINDS.map((k) => (
          <button
            key={k.value}
            onClick={() => select(k.value)}
            aria-pressed={kind === k.value}
            className={cn(
              "h-10 rounded-[10px] transition-colors",
              kind === k.value
                ? "bg-foreground font-extrabold text-background"
                : "font-semibold text-muted-foreground hover:text-foreground",
            )}
          >
            {k.label}
          </button>
        ))}
      </div>

      {kind === "workouts" && (
        <Link
          to={paths.progress}
          className="flex items-center gap-3.5 rounded-[22px] bg-accent px-4 py-4 text-accent-foreground"
        >
          <ChartLineUpIcon size={26} weight="bold" aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="block font-extrabold">Ver progresso</span>
            <span className="block text-[13px] font-medium">Volume, consistência e recordes</span>
          </span>
          <CaretRightIcon size={18} weight="bold" aria-hidden="true" />
        </Link>
      )}

      {kind === "cardio" ? <CardioHistory /> : <WorkoutHistory />}
    </div>
  );
};

const WorkoutHistory = () => {
  const store = useStore();
  const { finishedSessions } = store;

  if (finishedSessions.length === 0) {
    return (
      <EmptyState
        icon={ClockCounterClockwiseIcon}
        title="Nenhum treino concluído"
        description="Inicie um treino na aba Início e finalize-o para acompanhar sua evolução aqui."
        action={
          <Link
            to={paths.home}
            className="inline-flex h-12 items-center gap-2 rounded-2xl bg-primary px-5 font-extrabold text-primary-foreground"
          >
            Ver meus treinos
          </Link>
        }
      />
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {finishedSessions.map((s) => {
        const sets = store.setsBySession.get(s.id) ?? [];
        const exerciseCount = new Set(sets.map((x) => x.exerciseId)).size;
        return (
          <li key={s.id}>
            <Link
              to={paths.sessionDetail(s.id)}
              className="flex w-full items-center gap-3.5 rounded-[22px] border border-border bg-card p-3.5 pr-4 text-left transition-colors hover:bg-muted/40"
            >
              <span
                aria-hidden="true"
                className="flex h-13 w-12 shrink-0 flex-col items-center justify-center gap-0.5 rounded-[14px] bg-muted"
              >
                <span className="font-mono text-lg leading-none font-bold">
                  {new Date(s.startedAt).getDate()}
                </span>
                <span className="text-[10px] font-extrabold uppercase text-muted-foreground">
                  {WEEKDAY_SHORT[new Date(s.startedAt).getDay()]}
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-base font-extrabold">{s.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {relativeDay(s.startedAt)}{" "}
                  · {formatTime(s.startedAt)}
                  {s.finishedAt
                    ? ` · ${formatDuration(s.startedAt, s.finishedAt)}`
                    : ""}
                </span>
                <span className="mt-1.5 flex items-center gap-3 text-xs font-medium text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <ListChecksIcon size={14} weight="bold" /> {exerciseCount}{" "}
                    {exerciseCount === 1 ? "exercício" : "exercícios"}
                  </span>
                  <span className="font-mono">
                    {sets.length} {sets.length === 1 ? "série" : "séries"}
                  </span>
                </span>
              </span>
              <CaretRightIcon
                size={18}
                className="shrink-0 text-muted-foreground"
                weight="bold"
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
};
