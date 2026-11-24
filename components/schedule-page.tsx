"use client";

import { useMemo, useState } from "react";
import {
  CaretLeftIcon,
  CaretRightIcon,
  CheckIcon,
  MoonIcon,
} from "@phosphor-icons/react";
import {
  WEEKDAY_SHORT,
  dateKey,
  longDayLabel,
  monthGrid,
  monthLabel,
  shiftMonth,
} from "@/lib/dates";
import { isRepeating, resolvePlan } from "@/lib/schedule";
import { cn } from "@/lib/cn";
import { useStore } from "@/hooks/use-store";
import { useToday } from "@/hooks/use-today";
import { DayEditor } from "@/components/day-editor";
import { workoutInitial } from "@/lib/workout-stats";
import { useMediaQuery } from "@/hooks/use-media-query";

type View = { year: number; month: number };

export const SchedulePage = () => {
  const store = useStore();
  const today = useToday();
  const [view, setView] = useState<View | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  // telas largas: o painel do dia fica fixo ao lado do calendário, com hoje por padrão
  const wideScreen = useMediaQuery("(min-width: 64rem)");
  const panelDate = selected ?? today;

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

  const editor = (date: string, inline: boolean) => (
    <DayEditor
      key={inline ? date : undefined}
      inline={inline}
      date={date}
      workouts={store.workouts}
      current={resolvePlan(store.schedule, date)}
      repeating={isRepeating(store.schedule, date)}
      onApply={(plan, repeatWeekly) => {
        store.planDay(date, plan, repeatWeekly);
        setSelected(null);
      }}
      onStopRepeating={() => {
        store.stopRepeating(date);
        setSelected(null);
      }}
      onClose={() => setSelected(null)}
    />
  );

  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-5">
      <section aria-label="Calendário" className="lg:rounded-[28px] lg:border lg:border-border lg:bg-card lg:p-6">
        {shown ? (
          <>
            <div className="mb-3 flex items-center justify-between">
              <button
                onClick={() => setView(shiftMonth(shown.year, shown.month, -1))}
                aria-label="Mês anterior"
                className="grid size-11 place-items-center rounded-[14px] border border-border bg-card hover:bg-muted"
              >
                <CaretLeftIcon size={18} weight="bold" />
              </button>
              <h2 className="text-lg font-extrabold first-letter:uppercase font-stretch-semi-expanded">
                {monthLabel(shown.year, shown.month)}
              </h2>
              <button
                onClick={() => setView(shiftMonth(shown.year, shown.month, 1))}
                aria-label="Próximo mês"
                className="grid size-11 place-items-center rounded-[14px] border border-border bg-card hover:bg-muted"
              >
                <CaretRightIcon size={18} weight="bold" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1.5 text-center lg:gap-2">
              {WEEKDAY_SHORT.map((d) => (
                <span
                  key={d}
                  className="py-1 text-[11px] font-bold uppercase text-muted-foreground"
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
                      name={plan?.name ?? null}
                      initial={plan?.kind === "workout" ? workoutInitial(plan.name) : null}
                      done={done}
                      isToday={key === today}
                      isPast={!!today && key < today}
                      isSelected={wideScreen && key === panelDate}
                      onClick={() => setSelected(key)}
                    />
                  );
                })}
            </div>

            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <span className="grid size-3.5 place-items-center rounded-[5px] border border-input bg-muted text-[8px] font-extrabold">A</span> Planejado
              </li>
              <li className="flex items-center gap-1.5">
                <span className="size-3.5 rounded-[5px] border-[1.5px] border-dashed border-muted-foreground" /> Perdido
              </li>
              <li className="flex items-center gap-1.5">
                <MoonIcon size={12} weight="fill" /> Descanso
              </li>
              <li className="flex items-center gap-1.5">
                <span className="grid size-3.5 place-items-center rounded-[5px] bg-accent text-accent-foreground">
                  <CheckIcon size={9} weight="bold" />
                </span>{" "}
                Feito
              </li>
            </ul>
          </>
        ) : (
          <div className="h-80 rounded-3xl border border-border bg-card/40" />
        )}
      </section>

      {wideScreen ? panelDate && <aside aria-label="Dia escolhido">{editor(panelDate, true)}</aside> : selected && editor(selected, false)}
    </div>
  );
};

type DayCellProps = {
  day: number;
  label: string;
  kind: "workout" | "rest" | null;
  /** nome do plano, escrito na célula nas telas largas */
  name: string | null;
  /** dia aberto no painel ao lado (telas largas) */
  isSelected?: boolean;
  /** letra do treino planejado */
  initial: string | null;
  done: boolean;
  isToday: boolean;
  isPast: boolean;
  onClick: () => void;
};

const DayCell = ({ day, label, kind, name, initial, done, isToday, isPast, isSelected, onClick }: DayCellProps) => {
  const missed = kind === "workout" && !done && isPast;
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cn(
        "relative flex aspect-[1/1.1] flex-col items-center justify-center gap-0.5 rounded-[14px] border text-sm font-semibold transition-colors",
        // telas largas: célula alta com o número no topo e o nome do plano embaixo
        "lg:aspect-auto lg:min-h-24 lg:items-stretch lg:justify-between lg:p-2.5 lg:text-left",
        // cada caso define uma só cor de borda: classes de cor juntas brigam pela ordem do CSS
        done
          ? "border-accent bg-accent text-accent-foreground"
          : isToday
            ? cn("border-2 border-accent", kind === "workout" ? "bg-muted" : "bg-card")
            : missed
              ? "border-[1.5px] border-dashed border-muted-foreground/70 text-muted-foreground"
              : kind === "workout"
                ? "border-input bg-muted"
                : isPast || kind === "rest"
                  ? "border-transparent text-muted-foreground hover:bg-muted/60"
                  : "border-border bg-card hover:bg-muted/60",
        (isSelected || (isToday && done)) && "ring-2 ring-foreground ring-offset-2 ring-offset-background",
      )}
    >
      <span className="font-mono font-bold lg:text-base">{day}</span>
      <span aria-hidden="true" className="flex h-3 items-center text-[10px] leading-none font-extrabold lg:hidden">
        {kind === "rest" ? <MoonIcon size={12} weight="fill" /> : kind === "workout" ? initial : done ? <CheckIcon size={12} weight="bold" /> : null}
      </span>
      <span aria-hidden="true" className="hidden truncate text-xs leading-tight font-bold lg:block">
        {done ? `✓ ${name ?? "Feito"}` : kind === "workout" ? `${initial} · ${name}` : name}
      </span>
    </button>
  );
};
