"use client";

import { useMemo, useState } from "react";
import {
  CaretLeftIcon,
  CaretRightIcon,
  CheckIcon,
  ListChecksIcon,
  MoonIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import { Link } from "@/lib/router";
import type { Workout } from "@/types";
import {
  WEEKDAY_SHORT,
  dateKey,
  longDayLabel,
  monthGrid,
  monthLabel,
  shiftMonth,
} from "@/lib/dates";
import { isRepeating, resolvePlan } from "@/lib/schedule";
import { paths } from "@/lib/paths";
import { cn } from "@/lib/cn";
import { useStore } from "@/hooks/use-store";
import { useToday } from "@/hooks/use-today";
import { DayEditor } from "@/components/day-editor";
import { EmptyState } from "@/components/empty-state";

type View = { year: number; month: number };

export const SchedulePage = () => {
  const store = useStore();
  const today = useToday();
  const [view, setView] = useState<View | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const current: View | null = today
    ? { year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) - 1 }
    : null;
  const shown = view ?? current;

  const workoutNames = useMemo(
    () => new Map(store.workouts.map((w) => [w.id, w.name])),
    [store.workouts],
  );

  const doneDays = useMemo(
    () =>
      new Set(
        store.finishedSessions.map((s) => dateKey(new Date(s.startedAt))),
      ),
    [store.finishedSessions],
  );

  /** What the calendar shows for a date; null when nothing valid is planned. */
  const planOf = (key: string) => {
    const plan = resolvePlan(store.schedule, key)?.plan;
    if (plan?.type === "rest") return { kind: "rest" as const, name: "Descanso" };
    if (plan?.type === "workout") {
      const name = workoutNames.get(plan.workoutId);
      if (name) return { kind: "workout" as const, name };
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-8">
      <section aria-label="Calendário">
        {shown ? (
          <>
            <div className="mb-3 flex items-center justify-between">
              <button
                onClick={() => setView(shiftMonth(shown.year, shown.month, -1))}
                aria-label="Mês anterior"
                className="grid size-10 place-items-center rounded-xl border border-border bg-card hover:bg-muted"
              >
                <CaretLeftIcon size={18} weight="bold" />
              </button>
              <h2 className="text-base font-bold first-letter:uppercase">
                {monthLabel(shown.year, shown.month)}
              </h2>
              <button
                onClick={() => setView(shiftMonth(shown.year, shown.month, 1))}
                aria-label="Próximo mês"
                className="grid size-10 place-items-center rounded-xl border border-border bg-card hover:bg-muted"
              >
                <CaretRightIcon size={18} weight="bold" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {WEEKDAY_SHORT.map((d) => (
                <span
                  key={d}
                  className="py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  {d}
                </span>
              ))}
              {monthGrid(shown.year, shown.month)
                .flat()
                .map((key, i) => {
                  if (!key) return <span key={`empty-${i}`} />;
                  const plan = planOf(key);
                  const done = doneDays.has(key);
                  return (
                    <DayCell
                      key={key}
                      day={Number(key.slice(8))}
                      label={[
                        longDayLabel(key),
                        plan?.name,
                        done ? "treino feito" : null,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                      kind={plan?.kind ?? null}
                      done={done}
                      isToday={key === today}
                      onClick={() => setSelected(key)}
                    />
                  );
                })}
            </div>

            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-accent" /> Treino
              </li>
              <li className="flex items-center gap-1.5">
                <MoonIcon size={12} weight="fill" /> Descanso
              </li>
              <li className="flex items-center gap-1.5">
                <CheckIcon size={12} weight="bold" /> Feito
              </li>
            </ul>
          </>
        ) : (
          <div className="h-80 rounded-2xl border border-border bg-card/40" />
        )}
      </section>

      <WorkoutList workouts={store.workouts} />

      {selected && (
        <DayEditor
          date={selected}
          workouts={store.workouts}
          current={resolvePlan(store.schedule, selected)}
          repeating={isRepeating(store.schedule, selected)}
          onApply={(plan, repeatWeekly) => {
            store.planDay(selected, plan, repeatWeekly);
            setSelected(null);
          }}
          onStopRepeating={() => {
            store.stopRepeating(selected);
            setSelected(null);
          }}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
};

type DayCellProps = {
  day: number;
  label: string;
  kind: "workout" | "rest" | null;
  done: boolean;
  isToday: boolean;
  onClick: () => void;
};

const DayCell = ({ day, label, kind, done, isToday, onClick }: DayCellProps) => {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cn(
        "relative flex aspect-square flex-col items-center justify-center gap-0.5 rounded-xl border text-sm font-semibold transition-colors",
        isToday ? "border-accent" : "border-border",
        kind === "workout" ? "bg-accent/15" : "bg-card hover:bg-muted/50",
      )}
    >
      <span className={cn(isToday && "text-accent")}>{day}</span>
      <span className="flex h-3 items-center text-muted-foreground">
        {done ? (
          <CheckIcon size={12} weight="bold" className="text-accent" />
        ) : kind === "rest" ? (
          <MoonIcon size={12} weight="fill" />
        ) : kind === "workout" ? (
          <span className="size-2 rounded-full bg-accent" />
        ) : null}
      </span>
    </button>
  );
};

const WorkoutList = ({ workouts }: { workouts: Workout[] }) => {
  return (
    <section aria-labelledby="my-workouts">
      <div className="mb-3 flex items-baseline justify-between">
        <h2
          id="my-workouts"
          className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Meus treinos
        </h2>
        <span className="font-mono text-xs text-muted-foreground">
          {workouts.length}
        </span>
      </div>

      {workouts.length === 0 ? (
        <EmptyState
          icon={ListChecksIcon}
          title="Monte seu primeiro treino"
          description="Agrupe os exercícios de um dia (ex: Peito e Tríceps) em um treino e depois coloque-o na agenda."
          action={
            <Link
              to={paths.newWorkout}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 font-bold text-accent-foreground"
            >
              <PlusIcon size={20} weight="bold" /> Criar treino
            </Link>
          }
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {workouts.map((w) => (
            <li key={w.id}>
              <Link
                to={paths.workout(w.id)}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/50"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold">{w.name}</span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ListChecksIcon size={14} weight="bold" />
                    {w.exerciseIds.length}{" "}
                    {w.exerciseIds.length === 1 ? "exercício" : "exercícios"}
                  </span>
                </span>
                <CaretRightIcon
                  size={18}
                  className="shrink-0 text-muted-foreground"
                  weight="bold"
                />
              </Link>
            </li>
          ))}
          <li>
            <Link
              to={paths.newWorkout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-3.5 font-semibold text-muted-foreground transition-colors hover:border-accent hover:text-accent"
            >
              <PlusIcon size={20} weight="bold" />
              Criar treino
            </Link>
          </li>
        </ul>
      )}
    </section>
  );
};
